#!/usr/bin/env bash

sudo pacman -S --needed nodejs go

rm -rf ~/.local/bin/seraphim/
mkdir -p ~/.local/bin/seraphim
cp -r ./* ~/.local/bin/seraphim/

# Ensure the executable script has permission
chmod +x ~/.local/bin/seraphim/seraphimd.sh

# shellcheck disable=SC2164
cd ~/.local/bin/seraphim/

npm install

# Add alias if it doesn't already exist in .zshrc
if ! grep -q "alias seraphim=" ~/.zshrc 2>/dev/null; then
    echo "alias seraphim=\"node ~/.local/bin/seraphim/index.js\"" >> ~/.zshrc
fi

# Create systemd user service file (EOF expands $HOME to actual /home/user path)
cat <<EOF > seraphimd.service
[Unit]
Description=SeraphimD

[Service]
WorkingDirectory=$HOME/.local/bin/seraphim
ExecStart=$HOME/.local/bin/seraphim/seraphimd.sh
Restart=on-failure
Environment=PATH=$PATH:/usr/local/bin:/usr/bin

[Install]
WantedBy=default.target
EOF

mkdir -p ~/.config/systemd/user/
cp ./seraphimd.service ~/.config/systemd/user/

systemctl --user daemon-reload