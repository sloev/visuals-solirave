import os
import cv2
import argparse
import logging
log = logging.warning

from face_detection import select_face, select_all_faces
from face_swap import face_swap

parser = argparse.ArgumentParser(description='FaceSwapApp')
parser.add_argument('--warp_2d', default=False, action='store_true', help='2d or 3d warp')
parser.add_argument('--correct_color', default=False, action='store_true', help='Correct color')
parser.add_argument('--no_debug_window', default=False, action='store_true', help='Don\'t show debug window')
args = parser.parse_args()

directory = '/Users/foobar/Documents/faces/images2'


# compile list of videos
inputs = []
for f in os.listdir(directory):
    if os.path.isfile(f"/Users/foobar/Documents/faces/results/{f}.jpeg"):
        log(f"skipping {f}")
        continue
    inputs.append(os.path.join(directory, f))

for filename in inputs:
    log(filename)
    src_img = cv2.imread(filename)
    dst_img = cv2.imread("face.jpeg")
    if src_img is None or src_img.any():
        continue


    # Select src face
    src_points, src_shape, src_face = select_face(src_img, choose=False)
    # Select dst face
    dst_faceBoxes = select_all_faces(dst_img)

    if dst_faceBoxes is None:
        log('Detect 0 Face !!!')
        exit(-1)

    output = dst_img
    try:
        for k, dst_face in dst_faceBoxes.items():
            output = face_swap(src_face, dst_face["face"], src_points,
                                dst_face["points"], dst_face["shape"],
                                output, args)
    except KeyboardInterrupt:
        raise
    except:
        continue

    cv2.imwrite(f"./results/{os.path.basename(filename)}.jpeg", output)