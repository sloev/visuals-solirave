from moviepy.editor import *
from moviepy.video import *
from moviepy.video.fx.all import crop
import os
import random
import logging
from pathlib import Path

log = logging.warning

directory = '/Users/foobar/Downloads'


# compile list of videos
max_duration=3
inputs = []
for f in os.listdir(directory):
    if f.endswith(".mp4") or f.endswith(".m4v"):
        if os.path.isfile(os.path.join(directory, f)):
            if not os.path.isfile(os.path.join(directory, f+".done")):
                inputs.append(os.path.join(directory,f))
            else:
                log(f"skipping: {f}")
                
for filename in inputs:
    start = 0
    log(f"treating {filename}")
    try:
        clip = VideoFileClip(filename)
    except KeyError:
        continue
    (w, h) = clip.size

    # select a random time point
    while start < clip.duration-1:
        end = round(random.uniform(start+0.1,min(start+max_duration,clip.duration)), 2)
        out_clip = clip.subclip(start,end)
        out_clip = crop(out_clip, width=h, height=h, x_center=w/2, y_center=h/2)
        out_clip = out_clip.resize(width=800)
        out_clip = out_clip.without_audio()
        out_filename = f'./clips/{os.path.basename(filename)}.{start}_{end}_{clip.duration}.mp4'
        log(f"writing filename: {out_filename}")
        out_clip.write_videofile(out_filename)
        start = end+(max_duration*2)

    Path(filename+".done").touch()
