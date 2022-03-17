from math import sin, cos, sqrt, atan2, radians

# approximate radius of earth in km
R = 6373.0

lat1 = radians(14.07929417)
lon1 = radians(100.60152200)
lat2 = radians(14.07929417)
lon2 = radians(100.60152350)

dlon = lon2 - lon1
dlat = lat2 - lat1
 
print(dlon , dlat)
a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
c = 2 * atan2(sqrt(a), sqrt(1 - a))

distance = R * c

print("Result:", distance * 1000 *100)
print("Should be:", 278.546, "km")