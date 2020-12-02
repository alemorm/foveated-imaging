import matplotlib.pyplot as plt
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
    center_x, center_y = 50, 250
    processed = np.zeros([h, w, 3])
    for i in range(h):
        for j in range(w):
            distance = np.sqrt((center_x - i)**2 + (center_y - j)**2)
            # distance = np.abs(h - center_x) + np.abs(w - center_y)
            r = int(0.03 * distance)
            alpha = 0.03 * distance - r
            for k in range(3):
                processed[i, j, k] = (1 - alpha) * findMean(image, i, j, r, k) + alpha * findMean(image, i, j, r + 1, k)
                # processed[i, j, k] = findMean(image, i, j, r, k)
    return processed


img = plt.imread('1.jpg')
h, w, _ = img.shape
print(h,w)

import time
t1 = time.time()
new = meanFilter(img)
print(time.time() - t1)

display = np.concatenate([img, new], axis=1)
plt.imshow(display.astype('uint8'))
plt.show()