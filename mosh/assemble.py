from moviepy.editor import *
from moviepy.video import *
from moviepy.video.fx.all import crop
import os
import random
import logging
from pathlib import Path

log = logging.warning


directory = '/Users/foobar/Documents/mosh/clips'


# compile list of videos

inputs = []
for f in os.listdir(directory):
    if f.endswith(".mp4"):
        if os.path.isfile(os.path.join(directory, f)):
            inputs.append(os.path.join(directory,f))

random.shuffle(inputs)

max_length = 3600 #seconds
total_length = 0
outputs = []
for filename in inputs:
    log(f"examining {filename}")
    clip = VideoFileClip(filename)
    if total_length + clip.duration < max_length:
        outputs.append(clip)
log("concating")
final = concatenate_videoclips(outputs)
#writing the video into a file / saving the combined video
log("writing")
final.write_videofile("out.mp4")