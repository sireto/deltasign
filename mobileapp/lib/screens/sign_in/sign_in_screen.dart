import 'dart:async';

import 'package:delta_sign/components/form_errors.dart';
import 'package:delta_sign/config/size_config.dart';
import 'package:delta_sign/screens/otp/otp_screen.dart';
import 'package:delta_sign/themes.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:provider/provider.dart';

import '../../provider/ApiUrlProvider.dart';
import '../../validation.dart';

class SignInScreen extends StatefulWidget {
  @override
  _SignInScreenState createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  PageController _pageController = PageController(
    initialPage: 0,
  );
  FocusNode _emailFocusNode = FocusNode();
  int _currentPage = 0;
  //List<Color> colors = [Colors.blue, Colors.pink, Colors.orange];
  List<Color> colors = [Colors.white, Colors.white, Colors.white];
  List<String> titles = [
    "Upload PDF document",
    "Create Delta Sign Contract",
    "Signers Sign the Contract"
  ];
  List<String> bodies = [
    "Upload any PDF document you want to be signed on blockchain.",
    "Create a sign Contract and specify the signers. we'll send them email notification.",
    "The signers easily sign the contract. We take care of writing on the blockhain and signature verification."
  ];
  List<IconData> icons = [
    FontAwesomeIcons.fileAlt,
    FontAwesomeIcons.userTie,
    FontAwesomeIcons.fileInvoiceDollar
  ];
  TextEditingController _emailController = TextEditingController();
  List<String> errors = [];
  String _email;
  Timer _timer;
  ApiUrlProvider apiUrlProvider;
  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(Duration(seconds: 3), (timer) {
      if (_currentPage < 2) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }
      _pageController.animateToPage(_currentPage,
          duration: Duration(milliseconds: 350), curve: Curves.easeIn);
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _pageController.dispose();
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    apiUrlProvider = Provider.of<ApiUrlProvider>(context, listen: false);
    return Scaffold(
      body: Stack(
        children: [
          // builds onboarding view
          PageView.builder(
              controller: _pageController,
              onPageChanged: (value) {
                setState(() {
                  _currentPage = value;
                });
              },
              itemCount: icons.length,
              itemBuilder: (context, index) => buildBoard(
                  icon: icons[index],
                  title: titles[index],
                  body: bodies[index],
                  color: colors[index])),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              width: double.infinity,
              // height: 165 / 3.6 * SizeConfig.imageSizeMultiplier,
              padding:
                  EdgeInsets.only(top: 18, right: 10, left: 10, bottom: 15),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10),
                      topRight: Radius.circular(10)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.4),
                      spreadRadius: 3,
                      blurRadius: 5,
                      offset: Offset(0, 3),
                    )
                  ]),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Sign In",
                      style: TextStyle(
                          //fontFamily: "OpenSansBold",
                          letterSpacing: 0.8,
                          fontWeight: FontWeight.bold,
                          // color: Colors.grey.shade800,
                          fontSize: 14)),
                  SizedBox(height: 8),
                  Text("Get Started with your email address",
                      style: TextStyle(
                          // fontFamily: "OpenSans",
                          letterSpacing: 0.2,
                          fontWeight: FontWeight.w400,
                          // color: Colors.green,
                          fontSize: 12)),
                  SizedBox(height: 20),
                  _buildEmailInput(),
                  SizedBox(height: 15),
                  FormErrors(
                    errors: errors,
                  ),
                  SizedBox(height: errors.isNotEmpty ? 10 : 0),
                  _buildButton(),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Container _buildButton() {
    return Container(
      height: 48,
      child: ElevatedButton(
        onPressed: () {
          if (_formKey.currentState.validate()) {
            _formKey.currentState.save();
          }
          if (errors.isEmpty) {
            _emailFocusNode.unfocus();
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => OTPScreen(
                        email: _email,
                        apiUrlProvider: apiUrlProvider,
                      )),
            );
          }
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
                  color: Colors.white, fontSize: 15, letterSpacing: 0.2)),
        ),
      ),
    );
  }

  // image container
  Container buildBoard(
      {IconData icon, Color color, String title, String body}) {
    return Container(
      height: double.infinity,
      width: double.infinity,
      decoration: BoxDecoration(
          gradient: LinearGradient(
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
              colors: [
            color.withOpacity(0.3),
            color.withOpacity(0.3),
            Colors.white10,
            Colors.white10
          ])),
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            FaIcon(
              icon,
              size: 60,
              color: kprimaryColor,
            ),
            SizedBox(height: 10),
            Text(title,
                style: TextStyle(
                    letterSpacing: 1.5,
                    fontWeight: FontWeight.w600,
                    fontSize: 18)),
            SizedBox(height: 8),
            Container(
              margin: EdgeInsets.only(left: 10, right: 10),
              child: Text(body,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      letterSpacing: 0.2,
                      color: Colors.black54,
                      fontWeight: FontWeight.w300,
                      fontSize: 12)),
            ),
            SizedBox(height: 60),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                  titles.length, (index) => buildIndicator(index: index)),
            )
          ]),
    );
  }

  AnimatedContainer buildIndicator({int index}) {
    bool isSelected = index == _currentPage ? true : false;
    return AnimatedContainer(
        duration: Duration(milliseconds: 150),
        margin: EdgeInsets.only(right: 8),
        height: isSelected ? 7 : 6,
        width: isSelected ? 7 : 6,
        decoration: BoxDecoration(
            color: isSelected ? kprimaryColor : Colors.grey.shade300,
            borderRadius: BorderRadius.circular(5),
            boxShadow: [
              isSelected
                  ? BoxShadow(
                      color: kprimaryColor.withOpacity(0.72),
                      blurRadius: 4.0,
                      spreadRadius: 1.0,
                      offset: Offset(
                        0.0,
                        0.0,
                      ),
                    )
                  : BoxShadow(
                      color: Colors.transparent,
                    ),
            ]));
  }

  Form _buildEmailInput() {
    return Form(
      key: _formKey,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
            border: Border.all(color: Colors.grey, width: 1.5),
            borderRadius: BorderRadius.circular(12)),
        padding: EdgeInsets.only(left: 15),
        child: TextFormField(
          focusNode: _emailFocusNode,
          onTap: () {
            // _emailFocusNode.unfocus();
            // showMaterialModalBottomSheet(
            //   backgroundColor: Colors.transparent,
            //   context: context,
            //   isDismissible: false,
            //   animationCurve: Curves.easeInOutQuad,
            //   enableDrag: false,
            //   builder: (context) => SignInBottomSheet(),
            // );
          },
          keyboardType: TextInputType.emailAddress,
          cursorColor: Colors.black,
          decoration: new InputDecoration(
              border: InputBorder.none,
              focusedBorder: InputBorder.none,
              enabledBorder: InputBorder.none,
              errorBorder: InputBorder.none,
              disabledBorder: InputBorder.none,
              hintText: "Enter your email address",
              hintStyle: TextStyle(
                  // fontFamily: "OpenSans",
                  letterSpacing: 0.2,
                  // fontWeight: FontWeight.w400,
                  // color: Colors.grey.shade800,
                  fontSize: 14)),
          onChanged: (value) {
            if (value.isNotEmpty && errors.contains(kEmailNullError)) {
              setState(() {
                errors.remove(kEmailNullError);
              });
            }
            if (value.isNotEmpty &&
                emailValidatorRegExp.hasMatch(value) &&
                errors.contains(kInvalidEmailError)) {
              setState(() {
                errors.remove(kInvalidEmailError);
              });
            }
            return null;
          },
          validator: (value) {
            if (value.isEmpty && !errors.contains(kEmailNullError)) {
              setState(() {
                errors.add(kEmailNullError);
              });
            } else {
              if (value.isNotEmpty &&
                  !emailValidatorRegExp.hasMatch(value) &&
                  !errors.contains(kInvalidEmailError) &&
                  value.isNotEmpty) {
                setState(() {
                  errors.add(kInvalidEmailError);
                });
              }
            }
            return null;
          },
          onSaved: (value) => _email = value,
        ),
      ),
    );
  }
}
