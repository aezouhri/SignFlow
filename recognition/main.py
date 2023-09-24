import cv2
import mediapipe as mp
import numpy as np
import pickle
import asyncio
import websockets

# Initialize Mediapipe Hand module
mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

# Load the letter classification model
def load_model(model_path):
    with open(model_path, "rb") as model_file:
        model_dict = pickle.load(model_file)
        model = model_dict["model"]
    return model

# Process the received frames
async def process_frames(websocket, path):
    letter_model = load_model("classifier/classify_letter_model.p")
    with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as hands:
        while True:
            # Receive the frame from the client
            frame = await websocket.recv()
            print("Received")
            # Convert the frame to a numpy array
            np_frame = np.frombuffer(frame, dtype=np.uint8)
            image = cv2.imdecode(np_frame, cv2.IMREAD_COLOR)

            # Process the image with Mediapipe
            results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

            # Draw hand landmarks on the image
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            top_right = (image.shape[1] - 200, 30)
            top_left = (10, 30)
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    wrist_pos = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
                    right_hand, left_hand = "", ""
                    if wrist_pos.x > 0.5:
                        right_hand = "Right Hand"
                        x_values = [landmark.x for landmark in hand_landmarks.landmark]
                        y_values = [landmark.y for landmark in hand_landmarks.landmark]
                        data_aux = []
                        for i in range(len(hand_landmarks.landmark)):
                            data_aux.append(x_values[i] - min(x_values))
                            data_aux.append(y_values[i] - min(y_values))
                        letter = letter_model.predict([np.asarray(data_aux)])
                        letter = letter[0]
                        if letter == "UNKNOWN_LETTER":
                            letter = "Wrong input"
                        letter_size = cv2.getTextSize(
                            letter, cv2.FONT_HERSHEY_SIMPLEX, 1, 2
                        )[0]
                        letter_pos = (
                            (image.shape[1] - letter_size[0]) // 2,
                            image.shape[0] - 30,
                        )
                        cv2.putText(
                            image,
                            letter,
                            letter_pos,
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1,
                            (0, 0, 255),
                            2,
                        )

                    else:
                        left_hand = "Left Hand"
                    mp_drawing.draw_landmarks(
                        image, hand_landmarks, mp_hands.HAND_CONNECTIONS
                    )

                    cv2.putText(
                        image,
                        right_hand,
                        top_right,
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 0, 255),
                        2,
                    )
                    cv2.putText(
                        image,
                        left_hand,
                        top_left,
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 0, 255),
                        2,
                    )

            # Convert the processed image back to bytes
            _, encoded_image = cv2.imencode('.jpg', image)
            processed_frame = encoded_image.tobytes()
            print("about to send to cli")
            # Send the processed frame back to the client
            await websocket.send(processed_frame)

# Start the WebSocket server
start_server = websockets.serve('localhost', 8000, origins=["http://localhost:5173"])

# Run the event loop
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()