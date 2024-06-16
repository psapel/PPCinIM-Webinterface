import base64
b = base64.b64encode(bytes('https://iop.rwth-aachen.de/IM/aas/1/1/temperatureControlUnit_1', 'utf-8')) # bytes
base64_str = b.decode('utf-8') # convert bytes to string
print(base64_str)