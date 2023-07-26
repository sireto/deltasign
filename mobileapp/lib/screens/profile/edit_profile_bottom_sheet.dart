import 'package:delta_sign/components/form_errors.dart';
import 'package:delta_sign/config/size_config.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import '../../themes.dart';
import '../../validation.dart';

class EditProfileBottomSheet extends StatefulWidget {
  @override
  _EditProfileBottomSheetState createState() => _EditProfileBottomSheetState();
}

class _EditProfileBottomSheetState extends State<EditProfileBottomSheet> {
  GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  List<String> errors = [];
  String userName;
  bool isUploading = false;
  UserModel _userModel = GetIt.I.get();
  @override
  Widget build(BuildContext context) {
    return Container(
        padding: MediaQuery.of(context).viewInsets,
        child: Container(
            width: double.infinity,
            padding: EdgeInsets.only(right: 10, left: 10, bottom: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(10), topRight: Radius.circular(10)),
            ),
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  child: Stack(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 11.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text("Edit Name",
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.w600,
                                    fontSize: (16 / 3.6) *
                                        SizeConfig.textMultiplier)),
                          ],
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          IconButton(
                              icon: Icon(Icons.close_rounded,
                                  color: kprimaryColor),
                              onPressed: () {
                                Navigator.pop(context);
                              }),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 10 / 6.04 * SizeConfig.heightMultiplier),
                buildForm(),
                SizedBox(height: 10 / 6.04 * SizeConfig.heightMultiplier),
                FormErrors(
                  errors: errors,
                ),
                SizedBox(height: 30 / 6.04 * SizeConfig.textMultiplier),
                buildButton(),
                SizedBox(
                  height: 10 / 6.04 * SizeConfig.heightMultiplier,
                ),
              ],
            )));
  }

  Form buildForm() {
    return Form(
      key: _formKey,
      child: Container(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              child: TextFormField(
                autofocus: true,
                textAlignVertical: TextAlignVertical.center,
                style: buildFormTextStyle(),
                keyboardType: TextInputType.name,
                cursorColor: kprimaryColor,
                decoration: buildFormDecoration(
                    labelText: "Username", hintText: "Enter your name"),
                onSaved: (newValue) => userName = newValue,
                onChanged: (value) {
                  if (value.isNotEmpty && errors.contains(kNameNullError)) {
                    setState(() {
                      errors.remove(kNameNullError);
                    });
                  } else if (value.length >= 5 &&
                      errors.contains(kNameShortError)) {
                    setState(() {
                      errors.remove(kNameShortError);
                    });
                  }

                  return null;
                },
                validator: (value) {
                  if (value.isEmpty && !errors.contains(kNameNullError)) {
                    setState(() {
                      errors.add(kNameNullError);
                    });
                  } else if (value.length < 5 &&
                      !errors.contains(kNameShortError) &&
                      !errors.contains(kNameNullError)) {
                    setState(() {
                      errors.add(kNameShortError);
                    });
                  }

                  userName = value;
                  return null;
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future upload() async {
    // if (_image != null) {
    //   print("image is not null");
    //   Reference reference = FirebaseStorage.instance.ref();
    //   Reference rootReference =
    //       reference.child("profile").child(user.phoneNumber);
    //   rootReference.putFile(_image).then((storageTask) async {
    //     _imageLink = await storageTask.ref.getDownloadURL();
    //     print("imageLink: $_imageLink");
    //     user.updateProfile(photoURL: _imageLink);
    //   });
    // }

    if (userName != null) {
      if (userName.isNotEmpty) {
        print("user not null");
        await _userModel.updateProfile(fullName: userName);
      }
    }
    if (userName != null) {
      Navigator.pop(context, userName);
    } else {
      Navigator.pop(context);
    }
  }

  Container buildButton() {
    return Container(
      height: 48,
      child: ElevatedButton(
        onPressed: () async {
          if (_formKey.currentState.validate()) {
            _formKey.currentState.save();
          }
          if (errors.isEmpty) {
            setState(() {
              isUploading = true;
              upload();
            });
          }
        },
        style: ElevatedButton.styleFrom(
          primary: kprimaryColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
        ),
        child: Center(
          child: isUploading
              ? CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white))
              : Text('Submit',
                  style: TextStyle(
                      color: Colors.white, fontSize: 15, letterSpacing: 0.2)),
        ),
      ),
    );
  }
}
