// A constant pi up to 100 digits
const piValue = "141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067";


// Initialize an array to store the binary strings
const binaryStrings = [];

// Loop through each digit (0-9) to create the binary strings
for (let i = 0; i < 10; i++) {
    const digit = i.toString();
    let binaryString = "";

    // Loop through the first 20 digits of pi
    for (let j = 0; j < piValue.length; j++) {
        // If the current digit matches the desired digit, add '1', otherwise '0'
        binaryString += piValue[j] === digit ? "1" : "0";
    }

    // Push the binary string into the array
    binaryStrings.push(parseInt(binaryString, 2));
}

// Print the binary strings
binaryStrings.forEach((binaryString, index) => {
    console.log(`[${index}] = ${binaryString}`);
});
