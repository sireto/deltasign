import 'package:flutter/material.dart';

import '../../../themes.dart';

class SignInBottomSheet extends StatefulWidget {
  @override
  _SignInBottomSheetState createState() => _SignInBottomSheetState();
}

class _SignInBottomSheetState extends State<SignInBottomSheet> {
  FocusNode _emailFocusNode = FocusNode();
  TextEditingController _mobileController = TextEditingController();
  bool isMobileEmpty = true;

  List<String> errors = [];

  @override
  void dispose() {
    _mobileController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    _emailFocusNode.requestFocus();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () {
        return null;
      },
      child: Container(
        padding: MediaQuery.of(context).viewInsets,
        child: SingleChildScrollView(
          child: Container(
            width: double.infinity,
            padding: EdgeInsets.only(top: 18, right: 10, left: 10, bottom: 20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(10), topRight: Radius.circular(10)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Sign In",
                    style: TextStyle(
                        fontFamily: "OpenSansBold",
                        letterSpacing: 0.8,
                        fontWeight: FontWeight.w400,
                        // color: Colors.grey.shade800,
                        fontSize: 14)),
                SizedBox(height: 8),
                Text("Get Started with your email address",
                    style: TextStyle(
                        fontFamily: "OpenSans",
                        letterSpacing: 0.2,
                        fontWeight: FontWeight.w400,
                        // color: Colors.green,
                        fontSize: 12)),

                SizedBox(height: 20),
                _buildEmailInput(),
                // SizedBox(height: 10),
                // FormErrors(
                //   errors: errors,
                // ),
                SizedBox(height: 10),
                Container(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () {
                      // if (_mobileController.text.length < 4 &&
                      //     !errors.contains(kPhoneInvalidError)) {
                      //   setState(() {
                      //     errors.add(kPhoneInvalidError);
                      //   });
                      // } else if (errors.isEmpty) {
                      //   focusNode.unfocus();
                      //   showMaterialModalBottomSheet(
                      //       // duration: Duration(milliseconds: 600),
                      //       backgroundColor: Colors.white,
                      //       enableDrag: false,
                      //       animationCurve: Curves.easeInOutQuad,
                      //       expand: true,
                      //       context: context,
                      //       builder: (context) => OTPScreen(
                      //             countryCode: countryCode,
                      //             mobileNum: dialCode + _mobileController.text,
                      //             screen: widget.screen,
                      //           ));
                      // }
                    },
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      primary: kprimaryColor,
                    ),
                    child: Center(
                      child: Text('Continue',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              letterSpacing: 0.2)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Container _buildEmailInput() {
    return Container(
      width: double.infinity,
      // height: 45,
      decoration: BoxDecoration(
          border: Border.all(color: Colors.grey, width: 1.5),
          borderRadius: BorderRadius.circular(12)),
      padding: EdgeInsets.only(left: 15),
      child: TextField(
        keyboardType: TextInputType.phone,
        cursorColor: Colors.black,
        controller: _mobileController,

        //autofocus: true,
        onChanged: (value) {
          // setState(() {
          //   if (value.isNotEmpty) {
          //     isMobileEmpty = false;
          //     if (_mobileController.text.length >= 4 &&
          //         errors.contains(kPhoneInvalidError)) {
          //       setState(() {
          //         errors.remove(kPhoneInvalidError);
          //       });
          //     }
          //   } else {
          //     isMobileEmpty = true;
          //   }
          // });
        },
        focusNode: _emailFocusNode,
        decoration: new InputDecoration(
            border: InputBorder.none,
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            errorBorder: InputBorder.none,
            disabledBorder: InputBorder.none,
            hintText: "Enter your email address",
            hintStyle: TextStyle(
                fontFamily: "OpenSans",
                letterSpacing: 0.2,
                fontWeight: FontWeight.w500,
                // color: Colors.grey.shade800,
                fontSize: 14)),
      ),
    );
  }
}
