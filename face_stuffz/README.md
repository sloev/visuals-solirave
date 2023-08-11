pip install DuckDuckGoImages

https://roop-ai.gitbook.io/roop/installation/basic/macos

python main.py --src imgs/test6.jpg --dst imgs/test7.jpg --out results/output6_7_2d.jpg --correct_color --warp_2d


python main.py --src images_face_portrait_tintype_20230810_223741/3_6bb89a61b986c03d647a340b24ed1409.jpg --dst face.jpeg --out results/out.jpg --no_debug_window


ffmpeg -t 00:10:00 -i '/Users/foobar/loaf/film_grain.mp4' -vf fps=1 out%d.png
