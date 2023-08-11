import os
import cv2
import argparse
import logging
import cv2
import numpy as np
import random
from PIL import Image,ImageEnhance


log = logging.warning

from face_detection import select_face, select_all_faces
from face_swap import face_swap

def get_only_object(img, mask, back_img):
    fg = cv2.bitwise_or(img, img, mask=mask)        
    #imshow(fg)
    # invert mask
    mask_inv = cv2.bitwise_not(mask)    
    #fg_back = cv2.bitwise_or(back_img, back_img, mask=mask)
    fg_back_inv = cv2.bitwise_or(back_img, back_img, mask=mask_inv)
    #imshow(fg_back_inv)
    final = cv2.bitwise_or(fg, fg_back_inv)
    #imshow(final)

    return final

parser = argparse.ArgumentParser(description='FaceSwapApp')
parser.add_argument('--warp_2d', default=False, action='store_true', help='2d or 3d warp')
parser.add_argument('--correct_color', default=False, action='store_true', help='Correct color')
parser.add_argument('--no_debug_window', default=False, action='store_true', help='Don\'t show debug window')
args = parser.parse_args()

directory = '/Users/foobar/Documents/faces/results'
masks_directory = '/Users/foobar/Documents/faces/masks'

video_path="spice.mov"

# compile list of videos
inputs = []
for f in os.listdir(directory):
    inputs.append(os.path.join(directory, f))

masks = []
for f in os.listdir(masks_directory):
    masks.append(os.path.join(masks_directory, f))

video = cv2.VideoCapture(video_path)
orig_face_img = cv2.imread("face.jpeg")
orig_face_img_shape = orig_face_img.shape
orig_src_points, orig_src_shape, orig_src_face = select_face(orig_face_img, choose=False)

blank_face_img_pil = Image.new(mode="RGB", size=(orig_face_img_shape[1],orig_face_img_shape[0]))

index = 0
while video.isOpened():
    try:
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        _, dst_img = video.read()
        if os.path.isfile("./video_faces/face_swapped.{:010d}.jpeg".format(index)):
            index+=1
            continue

        log("got frame")
    
        random_face_filename = random.choice(inputs)
        random_face_img = Image.open(random_face_filename).convert('L').convert("RGB")
        

        random_mask_filename = random.choice(masks)
        (w,h) = orig_face_img_shape[1],orig_face_img_shape[0]
        mask = Image.open(random_mask_filename).convert('L').resize((w,h))
        enhancer = ImageEnhance.Brightness(mask)
        mask = enhancer.enhance(1.5)
        enhancer = ImageEnhance.Contrast(mask)
        mask = enhancer.enhance(1.5)
        sizes = (random_face_img.size, mask.size, blank_face_img_pil.size)


        blank_face_img_pil.paste(random_face_img, (0, 0), mask)
        blank_face_img = np.array(blank_face_img_pil)[:, :, ::-1].copy() 
        (x, y, w, h) = orig_src_shape

        src_face_region = blank_face_img[y:y + h, x:x + w]
        dst_img_blank = np.zeros(dst_img.shape, np.uint8)

        log("created new circle")
    


        # Select dst face
        dst_faceBoxes = select_all_faces(dst_img)
        log("got faces from video")

        if dst_faceBoxes is None:
            log('Detect 0 Face !!!')
            continue

        output = dst_img_blank
        try:
            for k, dst_face in dst_faceBoxes.items():
                (x, y, w, h) = dst_face["shape"]
                dst_face_region = dst_img_blank[y:y + h, x:x + w]
                output = face_swap(src_face_region, dst_face_region, orig_src_points,
                                    dst_face["points"], dst_face["shape"],
                                    output, args)
        except KeyboardInterrupt:
            raise
        except:
            logging.exception("err")
            raise
        cv2.imwrite("./video_faces/face_swapped.{:010d}.jpeg".format(index), output)
        # cv2.imwrite("./video_faces/face_input.{:010d}.jpeg".format(index), blank_face_img)
        index += 1
    except:
        logging.exception("err")
        raise