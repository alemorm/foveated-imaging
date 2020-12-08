import time
import matplotlib.pyplot as plt
import matplotlib.image as pltimage
import numpy as np


mean_dict = {}
def findMean(image, i, j, r, k):
    '''
    if (i,j,r,k) in mean_dict.keys():
        return mean_dict[(i,j,r,k)]
    else:
        mean = np.mean(image[max(0, i - r) : min(i + r + 1, h), max(0, j - r) : min(j + r + 1, w), k])
        mean_dict[(i,j,r,k)] = mean
        return mean
    '''
    return np.mean(image[max(0, i - r) : min(i + r + 1, h), max(0, j - r) : min(j + r + 1, w), k])

def meanFilter(image):
    h, w, _ = image.shape
    fovea_radius = 0.03
    center_x, center_y = 128, 128
    processed = np.ones([h, w, 3])
    for i in range(h):
        for j in range(w):
            distance = np.sqrt((center_x - i)**2 + (center_y - j)**2)
            distance = np.abs(h - center_x) + np.abs(w - center_y)
            r = int(fovea_radius * distance)
            alpha = fovea_radius * distance - r
            for k in range(3):
                processed[i, j, k] = (1 - alpha) * findMean(image, i, j, r, k) + alpha * findMean(image, i, j, r + 1, k)
                # processed[i, j, k] = findMean(image, i, j, r, k)
    return processed

def cachedFilter(imageArray):
    h, w, _ = imageArray[0].shape
    fovea_radius = 0.05
    center_x, center_y = 128, 128
    processed = np.ones([h, w, 3])
    for i in range(h):
        for j in range(w):
            distance = np.sqrt((center_x - i)**2 + (center_y - j)**2)
            distance = np.abs(h - center_x) + np.abs(w - center_y)
            r = int(fovea_radius * distance)
            processed[i,j,:] = imgArray[r][i,j,:]

    return processed

def allFilter(image, r):
    h, w, _ = image.shape
    processed = np.ones([h, w, 4])
    for i in range(h):
        for j in range(w):
            for k in range(3):
                processed[i, j, k] = findMean(image, i, j, r, k)/255

    return processed


imgname = '5.jpg'
img = plt.imread(imgname)
h, w, _ = img.shape
print(h,w)

imgArray = np.ones([19, h, w, 3])
imgArray[0] = img

for radius in range(1, 19):
    imgArray[radius] = plt.imread(f'preblur/{imgname.split(".")[0]}_{radius}.jpg')

t1 = time.time()
newimg = meanFilter(img)
print(time.time() - t1)

display = np.concatenate([imgArray[0], newimg], axis=1)
plt.imshow(display.astype('uint8'))
plt.show()

# for radius in range(1, 19):
#     t1 = time.time()
#     newimg = allFilter(img, radius)
#     print(time.time() - t1)
#     pltimage.imsave(f'preblur/{imgname.split(".")[0]}_{radius}.jpg', newimg)

# display = np.concatenate([img, new], axis=1)
# plt.imshow(display.astype('uint8'))
# plt.show()
