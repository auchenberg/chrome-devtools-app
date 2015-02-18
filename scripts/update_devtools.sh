
REPO_URL="http://src.chromium.org/blink/trunk"

echo "Nuking app/devtools folder"
rm -rf app/devtools
mkdir app/devtools

echo "Checking out blink devtools"
svn checkout "$REPO_URL/Source/devtools" app/devtools
find app/devtools -name '.svn' -type d -exec rm -rf {} \; > /dev/null

echo "Building generated scripts needed for DevTools"
node --harmony ./scripts/build_generated_scripts.js

echo "Injecting overrides needed for DevTools"
node --harmony ./scripts/inject_overrides.js

echo "Done."
