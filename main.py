# Initial file
import cv2
import mediapipe as mp
import numpy as np

# Initialize Mediapipe Hand module
mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

# Open video capture
cap = cv2.VideoCapture(1)

with mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as hands:

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            print("Ignoring empty camera frame.")
            continue

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
                print(wrist_pos)
                if wrist_pos.x > 0.5:
                    print("Right Hand")
                else:
                    print("Left Hand")
                mp_drawing.draw_landmarks(
                    image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # Display the image
        cv2.imshow('Hand Gestures', image)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q') or cv2.getWindowProperty('Hand Gestures', cv2.WND_PROP_VISIBLE) < 1:
            break

# Release the video capture and close all windows
cap.release()
cv2.destroyAllWindows()