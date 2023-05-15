import boto3
import json
import base64
from web3.auto import w3
from eth_account.messages import encode_defunct

NFT_TEST_FUNCTION_NAME = 'nftTest'
#CLIENT_WALLET_ADDRESS = '0xAB99397f2886cb5FA2862E475b57751C57c86551'
#PRIVATE_KEY = 'c17666611e52d7e2f529310df165e19640c157d7792709b9abc1084d54385892'


def load_file(file_name):
    with open(file_name, 'rb') as image_file:
        image_base64 = base64.b64encode(image_file.read())
    return image_base64.decode()


def sign_image(msg, client_private_key):
    message = encode_defunct(text=msg)
    signed_message = w3.eth.account.sign_message(message, private_key=client_private_key)
    return signed_message.signature.hex()


def nft_mint(wallet_address, filename, private_key):
    lambda_client = boto3.client('lambda', region_name='us-west-2')
    encoded_image = load_file(filename)
    client_signature = sign_image(encoded_image, private_key)

    payload = {
        "encodedImage": encoded_image,
        "clientSignature": client_signature,
        "clientWalletAddress": wallet_address
    }

    payload_bytes = bytes(json.dumps(payload), encoding='utf8')

    response = lambda_client.invoke(
        FunctionName=NFT_TEST_FUNCTION_NAME,
        InvocationType="RequestResponse",
        Payload=payload_bytes
    )

    print(response.get('Payload').read().decode('utf8'))
