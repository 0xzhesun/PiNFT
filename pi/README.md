# Pi Setup
All the scripts on devices were created in Python. For simplicity: 
- **wallet generation**: The script generates one wallet per life cycle. You need to take a note on the key pairs if you would like to reuse them. 
- **Image capture**: The script will turn on the camera stream, allowing you to make adjustments. The photo will be captured after a 5-second delay.
- **NFT mint**: The script will always mint NFTs using the most recently captured photo.

In addition to installing the dependencies in `requirements.txt`, please follow the installation process for [picamera2](https://github.com/raspberrypi/picamera2) if you run into any dependency issues. 

Please note that picamera2 does not support any legacy Raspberry Pi images based on Buster or earlier, nor does it support Bullseye with the legacy camera stack enabled. Feel free to modify the `captureImage.py` script as needed.


## Getting Started
1. Please follow the [instructions](https://www.raspberrypi.com/documentation/accessories/camera.html#installing-a-raspberry-pi-camera) if you encounter difficulties setting up your Pi and the camera

2. Install all the dependencies:
```python
pip install -r requirements.txt
```

3. Configure the aws credentials for boto3:
```
mkdir ~/.aws
vi credentials
```
Copy and paste the snippet below, filling in the corresponding fields:
```
[default]
aws_access_key_id=
aws_secret_access_key=
region=
```
For a more detailed setup process, refer to the boto3 [documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration).

4. In `invokeMint.py`, make sure the "NFT_MINT_FUNCTION_NAME" matches the Lambda fuction you created (or will create). 

5. Start the demo by running `demo.py`:
```
python demo.py
``` 

Congrats for making this far! Now enjoy the PoC.