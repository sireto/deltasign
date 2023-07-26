import 'package:flutter/material.dart';

class FormErrors extends StatelessWidget {
  final List<String> errors;
  FormErrors({this.errors});
  @override
  Widget build(BuildContext context) {
    return Column(
        children: List.generate(
            errors.length, (index) => formErrorText(errors[index])));
  }

  Row formErrorText(String error) {
    return Row(
      children: [
        Icon(
          Icons.error_outline_outlined,
          size: 13,
          color: Colors.red,
        ),
        SizedBox(width: 10),
        Text(error, style: TextStyle(fontSize: 11, color: Colors.red)),
      ],
    );
  }
}
