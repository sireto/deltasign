import 'dart:convert';

import 'package:delta_sign/config/size_config.dart';
import 'package:delta_sign/database/contract_operation.dart';

import 'package:delta_sign/database/server_operation.dart';

import 'package:delta_sign/models/user_model.dart';
import 'package:delta_sign/provider/ApiUrlProvider.dart';
import 'package:delta_sign/screens/homescreen/home_screen.dart';
import 'package:delta_sign/themes.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get_it/get_it.dart';
import 'package:keyboard_avoider/keyboard_avoider.dart';
import 'package:timer_count_down/timer_count_down.dart';
import 'package:http/http.dart' as http;
import 'package:timer_count_down/timer_controller.dart';

import '../../models/contract_model.dart';

class OTPScreen extends StatefulWidget {
  final String email;
  final ApiUrlProvider apiUrlProvider;
  OTPScreen({this.email, this.apiUrlProvider});
  @override
  _OTPScreenState createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final CountdownController _countController = new CountdownController();
  ContractOperation _dbContractOp = ContractOperation();
  FocusNode _focusNode2 = FocusNode();
  FocusNode _focusNode3 = FocusNode();
  FocusNode _focusNode4 = FocusNode();
  FocusNode _focusNode5 = FocusNode();
  FocusNode _focusNode6 = FocusNode();
  TextStyle _otpTextStyle;
  bool isLoading = false;
  bool isCodeSend = false;
  InputDecoration _otpInputDecoration;
  FocusNode pin1FocusNode;
  FocusNode pin2FocusNode;
  FocusNode pin3FocusNode;
  FocusNode pin4FocusNode;
  FocusNode pin5FocusNode;
  FocusNode pin6FocusNode;

  String pin1 = "";
  String pin2 = "";
  String pin3 = "";
  String pin4 = "";
  String pin5 = "";
  String pin6 = "";
  bool canResend = false;

  bool isError = false;

  @override
  void initState() {
    _sendCode();
    _otpTextStyle = TextStyle(fontSize: 18, color: Colors.black);
    _otpInputDecoration = InputDecoration(
        contentPadding: EdgeInsets.symmetric(vertical: 4.0),
        counterText: '',
        focusedBorder: UnderlineInputBorder(
            //borderRadius: BorderRadius.circular(12),

            borderSide: BorderSide(color: kprimaryColor, width: 1.7)),
        enabledBorder: UnderlineInputBorder(
            //borderRadius: BorderRadius.,
            borderSide: BorderSide(color: Colors.black54, width: 1.5)));
    pin1FocusNode = FocusNode();
    pin2FocusNode = FocusNode();
    pin3FocusNode = FocusNode();
    pin4FocusNode = FocusNode();
    pin5FocusNode = FocusNode();
    pin6FocusNode = FocusNode();

    super.initState();
  }

  @override
  void dispose() {
    pin2FocusNode.dispose();
    pin3FocusNode.dispose();
    pin4FocusNode.dispose();
    pin5FocusNode.dispose();
    pin6FocusNode.dispose();
    _focusNode2.dispose();
    _focusNode3.dispose();
    _focusNode3.dispose();
    _focusNode4.dispose();
    _focusNode5.dispose();
    _focusNode6.dispose();
    super.dispose();
  }

  void nextField(String value, FocusNode focusNode) {
    if (value.length == 1) {
      focusNode.requestFocus();
    }
  }

  void deleteField(String value, FocusNode focusNode) {
    if (value.isEmpty) {
      focusNode.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    FocusScopeNode _currentFocus = FocusScope.of(context);
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
          title: Text("Email Verification",
              style: TextStyle(
                  fontFamily: "OpenSans",
                  letterSpacing: 1,
                  color: Colors.black,
                  fontWeight: FontWeight.w500,
                  fontSize: 16)),
          centerTitle: true,
          backgroundColor: Colors.white,
          elevation: 0.0,
          actions: [
            IconButton(
                icon: Icon(
                  Icons.close_rounded,
                  size: 25 / 3.6 * SizeConfig.imageSizeMultiplier,
                  color: kprimaryColor,
                ),
                onPressed: () {
                  Navigator.pop(context);
                }),
            SizedBox(width: 15),
          ]),
      body: KeyboardAvoider(
        autoScroll: true,
        child: Stack(
          children: [
            Container(
              width: double.infinity,
              padding: EdgeInsets.only(left: 10, right: 10, bottom: 15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Container(
                    height: 250 / 6.04 * SizeConfig.heightMultiplier,
                    child: Image.asset(
                      'assets/otp/otp.png',
                      fit: BoxFit.fitWidth,
                    ),
                  ),
                  // SizedBox(height: 8),
                  // Text(
                  //   "Verify your email",
                  //   style: TextStyle(
                  //       fontFamily: "OpenSans",
                  //       color: Colors.black,
                  //       fontWeight: FontWeight.w700,
                  //       fontSize: 20,
                  //       letterSpacing: 1.5),
                  // ),
                  SizedBox(height: 8),
                  Text(
                      !isError
                          ? "We send your code to ${widget.email.substring(0, 7)} ***"
                          : "Failed to send code to ${widget.email.substring(0, 7)} ***",
                      style: TextStyle(
                          // fontFamily: "OpenSans",
                          letterSpacing: 0.2,
                          fontWeight: FontWeight.w300,
                          fontSize: 14)),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("You can resend code in ",
                          style: TextStyle(
                              //fontFamily: "OpenSans",
                              letterSpacing: 0.2,
                              fontWeight: FontWeight.w300,
                              fontSize: 12)),
                      buildTimer(),
                    ],
                  ),
                  SizedBox(height: 10),
                  canResend
                      ? InkWell(
                          onTap: () {
                            _currentFocus.unfocus();

                            setState(() {
                              _sendCode(canResend: canResend);
                              canResend = false;
                              _formKey.currentState.reset();
                            });
                          },
                          child: Text("Resend OTP code",
                              style: TextStyle(
                                  decoration: TextDecoration.underline,
                                  // fontFamily: "OpenSans",
                                  fontWeight: FontWeight.w400,
                                  fontSize: 14)),
                        )
                      : SizedBox(),
                  SizedBox(height: 30 / 6.04 * SizeConfig.heightMultiplier),
                  buildOtp(),
                  SizedBox(height: 60 / 6.04 * SizeConfig.heightMultiplier),
                  buildButton(),
                ],
              ),
            ),
            isCodeSend && !isLoading
                ? SizedBox()
                : Container(
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            SizedBox(
                              height: SizeConfig.screenHeight / 2.6,
                            ),
                            CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    kprimaryColor)),
                          ],
                        ),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Container buildButton() {
    return Container(
      height: 48,
      child: ElevatedButton(
        onPressed: () async {
          setState(() {
            isLoading = true;
            _verifyCode();
          });
        },
        style: ElevatedButton.styleFrom(
          primary: kprimaryColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
        ),
        child: Center(
          child: Text('Continue',
              style: TextStyle(
                  color: Colors.white, fontSize: 15, letterSpacing: 0.2)),
        ),
      ),
    );
  }

  Countdown buildTimer() {
    return Countdown(
      controller: _countController,
      seconds: 60,
      build: (BuildContext context, double time) => Text(
        "00:${time.toInt()}",
        style: TextStyle(color: Colors.red),
      ),
      interval: Duration(milliseconds: 100),
      onFinished: () {
        setState(() {
          canResend = true;
        });
      },
    );
  }

  Form buildOtp() {
    return Form(
      key: _formKey,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          SizedBox(
            width: 50,
            height: 50,
            child: TextFormField(
              focusNode: pin1FocusNode,
              // obscureText: true,
              keyboardType: TextInputType.number,
              style: _otpTextStyle,
              maxLength: 1,
              textAlign: TextAlign.center,
              cursorColor: Colors.black,
              decoration: _otpInputDecoration,

              onChanged: (value) {
                pin1 = value;
                nextField(value, pin2FocusNode);
              },
            ),
          ),
          RawKeyboardListener(
            onKey: (event) {
              if (event.logicalKey == LogicalKeyboardKey.backspace) {
                // here you can check if textfield is focused
                if (pin2.isEmpty) {
                  deleteField('', pin1FocusNode);
                }
              }
            },
            focusNode: _focusNode2,
            child: SizedBox(
              width: 50,
              height: 50,
              child: TextFormField(
                focusNode: pin2FocusNode,
                //obscureText: true,
                keyboardType: TextInputType.number,
                style: _otpTextStyle,
                textAlign: TextAlign.center,
                cursorColor: Colors.black,
                decoration: _otpInputDecoration,
                maxLength: 1,
                onChanged: (value) {
                  pin2 = value;

                  if (value.isNotEmpty) {
                    nextField(value, pin3FocusNode);
                  } else {
                    deleteField(value, pin1FocusNode);
                  }
                },
              ),
            ),
          ),
          RawKeyboardListener(
            onKey: (event) {
              if (event.logicalKey == LogicalKeyboardKey.backspace) {
                // here you can check if textfield is focused
                if (pin3.isEmpty) {
                  deleteField('', pin2FocusNode);
                }
              }
            },
            focusNode: _focusNode3,
            child: SizedBox(
              width: 50,
              height: 50,
              child: TextFormField(
                focusNode: pin3FocusNode,
                maxLength: 1,
                //obscureText: true,
                keyboardType: TextInputType.number,
                style: _otpTextStyle,
                textAlign: TextAlign.center,
                cursorColor: Colors.black,
                decoration: _otpInputDecoration,
                onChanged: (value) {
                  pin3 = value;

                  if (value.isNotEmpty) {
                    nextField(value, pin4FocusNode);
                  } else {
                    deleteField(value, pin2FocusNode);
                  }
                },
              ),
            ),
          ),
          RawKeyboardListener(
            onKey: (event) {
              if (event.logicalKey == LogicalKeyboardKey.backspace) {
                // here you can check if textfield is focused
                if (pin4.isEmpty) {
                  deleteField('', pin3FocusNode);
                }
              }
            },
            focusNode: _focusNode4,
            child: SizedBox(
              width: 50,
              height: 50,
              child: TextFormField(
                focusNode: pin4FocusNode,

                /// obscureText: true,
                keyboardType: TextInputType.number,
                style: _otpTextStyle,
                textAlign: TextAlign.center,
                cursorColor: Colors.black,
                maxLength: 1,
                decoration: _otpInputDecoration,
                onChanged: (value) {
                  pin4 = value;

                  if (value.isNotEmpty) {
                    nextField(value, pin5FocusNode);
                  } else {
                    deleteField(value, pin3FocusNode);
                  }
                },
              ),
            ),
          ),
          RawKeyboardListener(
            onKey: (event) {
              if (event.logicalKey == LogicalKeyboardKey.backspace) {
                // here you can check if textfield is focused
                if (pin5.isEmpty) {
                  deleteField('', pin4FocusNode);
                }
              }
            },
            focusNode: _focusNode5,
            child: SizedBox(
              width: 50,
              height: 50,
              child: TextFormField(
                focusNode: pin5FocusNode,
                // obscureText: true,
                keyboardType: TextInputType.number,
                style: _otpTextStyle,
                textAlign: TextAlign.center,
                cursorColor: Colors.black,
                maxLength: 1,
                decoration: _otpInputDecoration,
                onChanged: (value) {
                  pin5 = value;

                  if (value.isNotEmpty) {
                    nextField(value, pin6FocusNode);
                  } else {
                    deleteField(value, pin4FocusNode);
                  }
                },
              ),
            ),
          ),
          RawKeyboardListener(
            onKey: (event) {
              if (event.logicalKey == LogicalKeyboardKey.backspace) {
                // here you can check if textfield is focused
                if (pin6.isEmpty) {
                  deleteField('', pin5FocusNode);
                }
              }
            },
            focusNode: _focusNode6,
            child: SizedBox(
              width: 50,
              height: 50,
              child: TextFormField(
                focusNode: pin6FocusNode,
                //obscureText: true,
                keyboardType: TextInputType.number,
                style: _otpTextStyle,
                maxLength: 1,

                textAlign: TextAlign.center,
                cursorColor: Colors.black,
                decoration: _otpInputDecoration,
                onChanged: (value) {
                  pin6 = value;
                  if (value.isEmpty) {
                    deleteField(value, pin5FocusNode);
                  } else {
                    pin6FocusNode.unfocus();
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future _sendCode({bool canResend = false}) async {
    final url = "${widget.apiUrlProvider.apiuri}/users/login?email=";

    try {
      var response = await http.get(Uri.parse(url + widget.email.trim()),
          headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        print("successfully send");
        pin1FocusNode.requestFocus();
        canResend ? _countController.restart() : _countController.start();
        setState(() {
          isCodeSend = true;
        });
      } else {
        final snackBar = SnackBar(
            elevation: 6.0,
            backgroundColor: kerrorColor,
            behavior: SnackBarBehavior.floating,
            content: Text(
              "Validation Error !!",
              style: TextStyle(color: Colors.white, fontSize: 15),
            ),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(12))));
        ScaffoldMessenger.of(context).showSnackBar(snackBar);
      }
    } catch (e) {
      print("error $e");
      final snackBar = SnackBar(
          elevation: 6.0,
          backgroundColor: kerrorColor,
          behavior: SnackBarBehavior.floating,
          content: Text(
            "No Internet Connection !!",
            style: TextStyle(color: Colors.white, fontSize: 15),
          ),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(12))));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    }
  }

  Future _verifyCode() async {
    final url = "${widget.apiUrlProvider.apiuri}/users/login?email=";
    String pinCode = pin1 + pin2 + pin3 + pin4 + pin5 + pin6;

    if (pinCode.isNotEmpty) {
      final uri = Uri.parse(
          url + widget.email.trim() + "&login_code=" + pinCode.trim());
      try {
        var response =
            await http.post(uri, headers: {'Accept': 'application/json'});

        if (response.statusCode == 200) {
          UserModel userModel =
              await UserModel().setProfile(map: jsonDecode(response.body));

          ServerOp _serverOp = ServerOp(
              apiKey: userModel.apiKey, uuid: userModel.uuid, context: context);

          var snapshot = await _serverOp.getAllDoc();

          List snapshot1 = await _serverOp.getContract(sent: true);
          List snapshot2 = await _serverOp.getContract(received: true);
          List datas = snapshot1 + snapshot2;
          if (datas.isNotEmpty) {
            for (int i = 0; i < datas.length; i++) {
              if (datas[i]['send']) {
                List removedatas = [];
                for (int i = 0; i < datas.length - 1; i++) {
                  for (int j = i + 1; j < datas.length; j++) {
                    if (datas[i]['uuid'] == datas[j]['uuid']) {
                      removedatas.add(datas[j]);
                    }
                  }
                }

                for (int i = 0; i < removedatas.length; i++) {
                  datas.remove(removedatas[i]);
                }
              }
            }
            await _dbContractOp.addAll(datas);
            List<ContractModel> contracts = await _dbContractOp.getAll();
            if (datas.isNotEmpty) {
              contracts = contracts.reversed.toList();
            }
            if (GetIt.I.isRegistered<List<ContractModel>>()) {
              GetIt.I.unregister<List<ContractModel>>();
            }
            GetIt.I.registerSingleton<List<ContractModel>>(contracts);
          }
          if (snapshot != null || snapshot2 != null || snapshot1 != null) {
            Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => HomeScreen()),
                (r) => false);
          } else {
            print("error");
            setState(() {
              Fluttertoast.showToast(
                  msg: "Cannot connect to server\n Try again",
                  toastLength: Toast.LENGTH_SHORT,
                  gravity: ToastGravity.BOTTOM);
              isLoading = false;
            });
          }
        } else {
          final snackBar = SnackBar(
              elevation: 6.0,
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              content: Text(
                "Pin code doesnot match !!",
                style: TextStyle(color: Colors.white, fontSize: 15),
              ),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12))));
          ScaffoldMessenger.of(context).showSnackBar(snackBar);
          setState(() {
            isLoading = false;
          });
        }
      } catch (e) {
        final snackBar = SnackBar(
            elevation: 8.0,
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            content: Text(
              "No Internet Connection !!",
              style: TextStyle(color: Colors.white, fontSize: 15),
            ),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(12))));
        ScaffoldMessenger.of(context).showSnackBar(snackBar);
        setState(() {
          isLoading = false;
        });
      }
    } else {
      final snackBar = SnackBar(
          elevation: 8.0,
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          content: Text(
            "Fields are empty !!",
            style: TextStyle(color: Colors.white, fontSize: 15),
          ),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(12))));
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
      setState(() {
        isLoading = false;
      });
    }
  }
}
