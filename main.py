# Initial file
import cv2
import mediapipe as mp
import numpy as np
import pickle

# Initialize Mediapipe Hand module
mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands


def load_model(model_path):
    with open(model_path, "rb") as model_file:
        model_dict = pickle.load(model_file)
        model = model_dict["model"]
    return model


def webcam():
    # Open video capture
    cap = cv2.VideoCapture(1)
    letter_model = load_model("classifier\classify_letter_model.p")
    with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as hands:
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                continue

            top_right = (image.shape[1] - 200, 30)
            top_left = (10, 30)
            # Flip the image horizontally for a later selfie-view display
            image = cv2.flip(image, 1)
            # Convert the image to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Process the image with Mediapipe
            results = hands.process(image)

            # Draw hand landmarks on the image
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
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

            # Display the image
            cv2.imshow("Hand Gestures", image)

            # Break the loop if 'q' is pressed
            if (
                cv2.waitKey(1) & 0xFF == ord("q")
                or cv2.getWindowProperty("Hand Gestures", cv2.WND_PROP_VISIBLE) < 1
            ):
                break

    # Release the video capture and close all windows
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    webcam()
