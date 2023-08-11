from PIL import Image,ImageEnhance
import os
import random
import logging
log = logging.warning

contrast=3
sharpness=4
brightness=0.4
inputs = []

directory = '/Users/foobar/Documents/faces/results'


# compile list of videos
inputs = []
for f in os.listdir(directory):
    inputs.append(os.path.join(directory, f))



margin=20
left=126
right=660
top=372
bottom=954
width = (right-left)
total_width = width*10
half_width = int(width/2)

height = (bottom-top)
mask = Image.open('triangle_mask.png').convert('L').resize((width,height))

composite_image = Image.new(mode="RGB", size=(total_width,height))

flip = False
i=0
for u in range(2):
    for filename in inputs:
        log(filename)

        new_img = Image.open(filename).crop((left, top, right, bottom)).convert('L').convert("RGB")
        enhancer = ImageEnhance.Brightness(new_img)
        # to reduce brightness by 50%, use factor 0.5
        new_img = enhancer.enhance(brightness)
        #image brightness enhancer

        enhancer = ImageEnhance.Sharpness(new_img)
        new_img = enhancer.enhance(sharpness) 

        enhancer = ImageEnhance.Contrast(new_img)



        new_img = enhancer.enhance(contrast)
        #image brightness enhancer

        enhancer = ImageEnhance.Brightness(new_img)
        new_img = enhancer.enhance(1.4)

        composite_image = composite_image.crop((half_width+margin, 0, total_width+half_width, height))

        composite_image = composite_image.transpose(Image.FLIP_TOP_BOTTOM)
        composite_image.paste(new_img, (total_width-(half_width*3), 0), mask)

        # else:
        #     composite_image.paste(new_img, (total_width-half_width, 0), mask)

        composite_image.crop((0, 0, total_width-width*3+margin, height)).save("composite_results/{:010d}.jpg".format(i), quality=100)
        
        flip=not flip
        i+=1


        

