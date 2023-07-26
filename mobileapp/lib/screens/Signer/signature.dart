import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:delta_sign/config/size_config.dart';
import 'package:delta_sign/themes.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get_it/get_it.dart';
import 'package:flutter/widgets.dart';
import 'package:image/image.dart';
import 'package:path_provider/path_provider.dart';
import 'package:easy_signature_pad/easy_signature_pad.dart';
import 'package:signature/signature.dart';

class Signaturee extends StatefulWidget {
  const Signaturee({
    Key key,
  }) : super(key: key);

  @override
  _SignatureeState createState() => _SignatureeState();
}

class _SignatureeState extends State<Signaturee> {
  GlobalKey signkey = GlobalKey();
  Size signaturesize;
  var height;
  var width;
  Uint8List signatureBytes;
  // final SignatureController controller = SignatureController(
  //     penColor: Colors.black,
  //     penStrokeWidth: 2,
  //     exportBackgroundColor: Colors.white);
  // UserModel _userModel = GetIt.I.get();
  // @override
  // void dispose() {
  //   super.dispose();
  //   //controller.dispose();
  // }
  void setImage(String bytes) async {
    if (bytes.isNotEmpty) {
      Uint8List convertedBytes = base64Decode(bytes);
      setState(() {
        signatureBytes = convertedBytes;
      });
    } else {
      setState(() {
        signatureBytes = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
            onPressed: () => Navigator.pop(context),
            icon: Icon(
              Icons.arrow_back_ios_new,
              //size: 30,
              color: Colors.black,
            )),
        // automaticallyImplyLeading: false,
        elevation: 0,
        // actions: [
        //   IconButton(
        //       onPressed: () => Navigator.pop(context),
        //       icon: Icon(
        //         Icons.clear,
        //         size: 30,
        //         color: Colors.black,
        //       )),
        //   SizedBox(width: 10),
        // ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              SizedBox(height: 90),
              Center(
                child: EasySignaturePad(
                  onChanged: (image) {
                    setImage(image);
                  },
                  height: (SizeConfig.screenWidth) ~/ 3,
                  width: (SizeConfig.screenWidth).toInt(),
                  penColor: Colors.black,
                  strokeWidth: 2.0,
                  borderRadius: 10.0,
                  borderColor: Colors.black,
                  backgroundColor: Colors.white,
                  transparentImage: true,
                  transparentSignaturePad: false,
                ),
                // Signature(
                //    height: (SizeConfig.screenWidth-30)/3,
                // width: (SizeConfig.screenWidth-30),
                //     controller: controller,

                //     backgroundColor: Colors.white,
                //   ),
              ),
              Container(
                alignment: Alignment.bottomCenter,
                height: 40,
                margin: const EdgeInsets.only(bottom: 10, top: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Container(
                        width: 90,
                        child: ElevatedButton(
                          onPressed: () async {
                            if (signatureBytes.isNotEmpty) {
                              Directory directory = GetIt.I.get();
                              var filename =
                                  String.fromCharCodes(signatureBytes);
                              final pngfile =
                                  await File('${directory.path}/$filename')
                                      .create();

                              await pngfile.writeAsBytes(signatureBytes);
                              Navigator.pop(context, pngfile);
                            }
                            // if (signature.isNotEmpty) {
                            //   final signature = await exportSignature();

                            //   Directory directory = GetIt.I.get();

                            //   //String filename = basename(signature.toString());
                            //   var filename = String.fromCharCodes(signature);
                            //   final pngfile =
                            //       await File('${directory.path}/$filename')
                            //           .create();
                            //   final Uint8List bytes =
                            //       signature.buffer.asUint8List();
                            //   await pngfile.writeAsBytes(bytes);
                            //   // var image = copyResize(
                            //   //     decodeImage(pngfile.readAsBytesSync()),
                            //   //     height: 250,
                            //   //     width: 750);
                            //   // pngfile.writeAsBytesSync(encodePng(image));
                            //   controller.clear();
                            //   Navigator.pop(context, pngfile);
                            //   //ServerOp(apiKey: _userModel.apiKey).sign(pngfile.path, "8466c7a0-9b30-4912-bd3e-295f09478a67");
                            // }
                          },
                          child: Text("Save"),
                          style: ElevatedButton.styleFrom(
                              primary: kprimaryColor,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 12)),
                        )),
                    // Container(
                    //     child: ElevatedButton(
                    //   onPressed: () {
                    //     controller.clear();
                    //   },
                    //   child: Text("Clear"),
                    //   style: ElevatedButton.styleFrom(
                    //       shape: RoundedRectangleBorder(
                    //           borderRadius: BorderRadius.circular(12)),
                    //       primary: Colors.grey,
                    //       padding: const EdgeInsets.symmetric(
                    //           horizontal: 20, vertical: 12)),
                    // ))
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  // Future exportSignature() async {
  //   final exportSignature = SignatureController(
  //       penColor: Colors.black,
  //       penStrokeWidth: 2,
  //       exportBackgroundColor: Colors.transparent,
  //       points: controller.points

  //       );

  //   final signature = await exportSignature.toPngBytes();
  //   exportSignature.dispose();

  //   return signature;
  // }
}
