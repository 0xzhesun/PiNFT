import generateWallet as wallet
import captureImage as capture
import invokeMint as mint

if __name__ == '__main__':
    address = None
    private_key = None
    public_key = None
    counter = 0

    while True:
        print("Please choose an option:")
        print("1: Generate Ethereum Wallet")
        print("2: Take a Photo")
        print("3: Mint NFTs for Latest Photo")
        print("4: Exit")
        choice = input("Enter your choice: ")
        
        if choice == "1":
            if not address:
                private_key, public_key, address = wallet.generate_keys()
                print("Private key:", private_key)
                print("Public key: ", public_key)
                print("Wallet address:    ", address)
                print()

            else:
                print("Wallet already generated.\nThe address is:", address)
                print()
        elif choice == "2":
            filename = str(counter) + ".jpg"
            capture.capture_photo(filename)
            print("Photo saved as", filename)
            print()
            counter += 1

        elif choice == "3":
            mint.nft_mint(address, filename, private_key)
            print()
        elif choice == "4":
            print("Exiting...")
            break
        else:
            print("Invalid choice, please choose again.")
