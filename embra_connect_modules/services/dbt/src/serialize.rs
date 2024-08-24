use urlencoding::decode;

/*  This module decodes [ENCODED] data using the <urlencoding> crate,
    then parses the hexadecimal representation
    back into its original string form.
*/

#[derive(Debug)]
pub struct EncodedData {
    pub encoded_data: String,
}

impl EncodedData {
    pub fn decode_url_data(&self) -> String {
        let decoded_data = decode(&self.encoded_data).unwrap();

        let mut decoded_string = String::new();
        let mut hex_chars = decoded_data.chars();

        // Decode chars
        while let Some(start) = hex_chars.next() {
            if let Some(end) = hex_chars.next() {
                let hex_str = format!("{}{}", start, end);
                let decode_char = u8::from_str_radix(&hex_str, 16).unwrap() as char;

                decoded_string.push(decode_char);
            }
        }

        // Debugging -> Print the [DECODED] data to the [CONSOLE]
        // print!("{:?}", decode_string);
        // Return the [DECODED] string
        decoded_string
    }
}

#[cfg(test)]
mod tests {
    use crate::serialize::EncodedData;

    #[test]
    fn serialize_test() {
        let data = EncodedData {
            encoded_data: "646274755f646d666968324556644638335673756474366e6173695568736a6864376a384f414c776631366f".to_string()
        };

        let token = "dbtu_dmfih2EVdF83Vsudt6nasiUhsjhd7j8OALwf16o";
        let decoded_data = data.decode_url_data();

        assert_eq!(token, decoded_data);
    }
}

/*
    [MODULE] DOCUMENTATION

    while let Some(hex1) = hex_chars.next():

    This initiates a loop that iterates over the characters in the hex_chars iterator.
    hex_chars is an iterator over the characters of the decoded token string.
    hex_chars.next() returns an Option<char>, where Some(char) represents a character,
    and None indicates the end of the iterator.
    This construct allows the loop to continue as long as there are characters left in the iterator.


    if let Some(hex2) = hex_chars.next():

    Within the loop, another if let statement is used to retrieve the next character from the iterator.
    This is done because hexadecimal digits are represented by pairs of characters,
    so for each iteration of the loop, we need to retrieve two characters to represent a single hexadecimal digit.


    let hex_str = format!("{}{}", hex1, hex2);:

    This line constructs a string hex_str by concatenating hex1 and hex2.
    This concatenation forms a string representing a hexadecimal digit.


    let decoded_char = u8::from_str_radix(&hex_str, 16).unwrap() as char;:

    This line parses the string hex_str as a hexadecimal number using u8::from_str_radix().
    The 16 parameter specifies that the string should be interpreted as base 16 (hexadecimal).
    The result is unwrapped using .unwrap(), assuming the parsing succeeds.
    The parsed number is then cast to a char, assuming it represents a valid Unicode code point.


    decoded_string.push(decoded_char);:

    Finally, the decoded character is appended to the decoded_string, which accumulates the decoded characters.
*/
