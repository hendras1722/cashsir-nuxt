import os
import sys
import argparse

def main():
    parser = argparse.ArgumentParser(description="MSA Execution Utilities")
    parser.add_argument("--check-env", action="store_true", help="Check if .env exists")
    parser.add_argument("--list-tmp", action="store_true", help="List contents of .tmp/")
    
    args = parser.parse_args()
    
    if args.check_env:
        if os.path.exists(".env"):
            print("[SUCCESS] .env file found.")
        else:
            print("[WARNING] .env file not found. Check execution/.env.example")
            
    if args.list_tmp:
        tmp_dir = ".tmp"
        if os.path.exists(tmp_dir):
            files = os.listdir(tmp_dir)
            print(f"[INFO] Contents of {tmp_dir}: {files}")
        else:
            print(f"[ERROR] {tmp_dir} directory missing.")

if __name__ == "__main__":
    main()
