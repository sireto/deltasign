import 'dart:io';

import 'package:delta_sign/config/size_config.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:delta_sign/themes.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'edit_profile_bottom_sheet.dart';

class EditProfileScreen extends StatefulWidget {
  final UserModel userModel;
//  final CountryCode countryCode;

  EditProfileScreen({this.userModel});

  @override
  _EditProfileScreenState createState() => _EditProfileScreenState(userModel);
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  UserModel userModel;
  File _image;
  String mobileNum;
  String _imageLink;

  //CountryCode countryCode;
  _EditProfileScreenState(this.userModel);
  bool isUploading = false;
  bool isUserChanged = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: kprimaryColor,
        title: Text(
          "Profile",
          style: TextStyle(
              letterSpacing: 1,
              fontWeight: FontWeight.w500,
              fontSize: 16 / 3.6 * SizeConfig.textMultiplier),
        ),
        centerTitle: true,
        elevation: 0.0,
      ),
      body: WillPopScope(
        onWillPop: () async {
          Navigator.pop(context, userModel);
          return true;
        },
        child: SingleChildScrollView(
          child: Container(
            padding: EdgeInsets.all(10),
            width: double.infinity,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: 40 / 6.04 * SizeConfig.heightMultiplier),
                InkWell(
                  onTap: () async {
                    if (userModel.uuid != null) {
                      XFile pickedImage = await ImagePicker.platform
                          .getImageFromSource(source: ImageSource.gallery);
                      setState(() {
                        isUploading = true;
                        _image = File(pickedImage.path);
                        // userModel.updateProfile(imagePath: _image.path);
                        upload();
                      });
                    }
                  },
                  child: buildCircleAvatar(),
                ),
                SizedBox(height: 40 / 6.04 * SizeConfig.heightMultiplier),
                buildCard(
                  title: "Name",
                  subTitle: userModel.fullName == null
                      ? "Anonymous"
                      : userModel.fullName,
                  //  subTitle: "Anonymous",
                  iconData: Icons.edit,
                  isEditable: true,
                  onPressed: () {
                    // if (userModel.uuid != null) {
                    Future saved = showModalBottomSheet(
                      backgroundColor: Colors.transparent,
                      context: context,
                      isDismissible: false,
                      // animationCurve: Curves.easeInOutQuad,
                      enableDrag: false,
                      builder: (context) => SingleChildScrollView(
                        // controller: ModalScrollController.of(context),
                        child: EditProfileBottomSheet(
                            //countryCode: countryCode,
                            ),
                      ),
                    );
                    saved.then((value) {
                      if (value != null) {
                        setState(() {
                          userModel.fullName = value;
                          isUserChanged = true;
                        });
                      }
                    });
                    //}
                  },
                ),
                // SizedBox(height: 10 / 6.04 * SizeConfig.heightMultiplier),
                // buildCard(
                //     title: "Location",
                //     subTitle: countryCode.name!,
                //     iconData: Icons.edit_location_outlined,
                //     onPressed: () {
                //       Future result = showMaterialModalBottomSheet(
                //         backgroundColor: Colors.transparent,
                //         context: context,
                //         builder: (context) => SingleChildScrollView(
                //           controller: ModalScrollController.of(context),
                //           child: CountryPickerBottomSheet(
                //             countryCode: countryCode,
                //           ),
                //         ),
                //       );
                //       result.then((value) {
                //         if (value.name != countryCode.name) {
                //           setState(() {
                //             countryCode = value;
                //           });
                //         }
                //       });
                //     }),

                userModel.email == null
                    ? SizedBox(
                        height: 0,
                      )
                    : Column(
                        children: [
                          SizedBox(
                              height: 10 / 6.04 * SizeConfig.heightMultiplier),
                          buildCard(
                              title: "Email",
                              subTitle: userModel.email,
                              iconData: Icons.edit,
                              isEditable: false),
                        ],
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future upload() async {
    if (_image != null) {
      // Reference reference = FirebaseStorage.instance.ref();
      // Reference rootReference =
      //     reference.child("profile").child(userModel!.uids![0]);
      // rootReference.putFile(_image!).then((storageTask) async {
      //   _imageLink = await storageTask.ref.getDownloadURL();
      //   print("imageLink: $_imageLink");
      // try {
      await userModel.updateProfile(imagePath: _image.path);
      setState(() {
        isUploading = false;
        userModel.imagePath = _image.path;
        isUserChanged = true;
      });
      // } catch (e) {
      //   // print(e.message);
      // }
      // });
    }
  }

  Container buildCard(
      {String title,
      String subTitle,
      IconData iconData,
      Function() onPressed,
      bool isEditable = true}) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.4),
              spreadRadius: 3,
              blurRadius: 7,
              offset: Offset(0, 3),
            )
          ]),
      child: Padding(
        padding: const EdgeInsets.only(left: 18.0, top: 14, bottom: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          color: isEditable ? Colors.black : Colors.black54,
                          fontSize: 14)),
                  SizedBox(height: 4 / 3.6 * SizeConfig.textMultiplier),
                  Text(subTitle,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          color: isEditable ? Colors.black : Colors.black54,
                          fontWeight: FontWeight.bold,
                          fontSize: 15)),
                ],
              ),
            ),
            isEditable
                ? IconButton(
                    icon:
                        Icon(iconData, color: Colors.purple.shade300, size: 18),
                    onPressed: onPressed,
                  )
                : SizedBox(),
          ],
        ),
      ),
    );
  }

  CircleAvatar buildCircleAvatar() {
    return CircleAvatar(
        radius: 50 / 3.6 * SizeConfig.widthMultiplier,
        backgroundColor: Colors.grey.shade400,
        child: Stack(
          fit: StackFit.expand,
          children: [
            userModel.imagePath != null
                ? ClipOval(
                    child: Image.file(
                      File(userModel.imagePath),
                      fit: BoxFit.cover,
                    ),
                  )
                :
                //         : ClipOval(
                //             child: Image.network(
                //             userModel.imageUrl != null
                //                 ? userModel.imageUrl
                //                 : "",
                //             fit: BoxFit.cover,
                //           ))
                ClipOval(
                    child: Image.asset('assets/user.png', fit: BoxFit.cover)),
            Align(
              alignment: Alignment.bottomRight,
              child: Icon(Icons.camera_alt,
                  color: Colors.indigo.shade300,
                  size: 22 / 3.6 * SizeConfig.imageSizeMultiplier),
            ),
          ],
        )
        // : Center(
        //     child: CircularProgressIndicator(
        //         valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
        //   ),
        );
  }
}
