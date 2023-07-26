import 'package:flutter/material.dart';

const kprimaryColor = Color(0xff24405c);
const Color kerrorColor = Color(0xffc2185b);
const Color ktextColor = Colors.black;
// const String fontFamily = "OpenSans";
// const String fontFamilyBold = "OpenSansBold";
const Color kbgColor = Colors.white10;

TextStyle buildFormTextStyle() {
  return TextStyle(
      fontSize: 14,
      color: Colors.black,
      fontWeight: FontWeight.w300,
      letterSpacing: 0.2);
}

InputDecoration buildFormDecoration({String labelText, String hintText}) {
  return InputDecoration(
    border: OutlineInputBorder(
      borderRadius: BorderRadius.all(Radius.circular(12.0)),
    ),
    labelText: labelText,
    focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(12.0)),
        borderSide: BorderSide(color: kprimaryColor)),
    hintText: hintText,
    floatingLabelBehavior: FloatingLabelBehavior.always,
  );
}
