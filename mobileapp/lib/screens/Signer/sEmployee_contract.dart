import 'dart:io';
import 'dart:convert';
import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:delta_sign/database/contract_operation.dart';
import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:delta_sign/screens/Signer/signature.dart';
import 'package:delta_sign/screens/homescreen/home_screen.dart';
import 'package:delta_sign/themes.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_fullpdfview_fork/flutter_fullpdfview_fork.dart';
import 'package:delta_sign/database/server_operation.dart';
import 'package:flutter/widgets.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get_it/get_it.dart';
import 'package:path/path.dart';

class SEmployee extends StatefulWidget {
  final ContractModel contractmodel;
  const SEmployee({Key key, this.contractmodel}) : super(key: key);

  @override
  _SEmployeeState createState() => _SEmployeeState(contractmodel);
}

class _SEmployeeState extends State<SEmployee> {
  ContractModel _contracts;
  _SEmployeeState(this._contracts);
  UserModel _usermodel = GetIt.I.get();
  File signPng;
  bool isSigned = false;
  final GlobalKey pdfkey = GlobalKey();
  Size pdfscreensize;
  Offset pdfposition;
  Dio dio = new Dio();
  Directory _appDir = GetIt.I.get();
  int downloadprogress;
  int pages = 0;
  int indexpages = 0;
  int selectedindex = 0;
  int currenttab = 0;
  List x1 = [];
  List y1 = [];
  List x2 = [];
  List y2 = [];
  double pageh; //height of page from pdf view library
  double pagew; //width of screen from pdf view library
  double screenhp; //height of screen from pdf view library
  double screenwp; //width of screen from pdf view library
  double screenpdfoh; //pdfoverlap height of screen
  double screenpdfow; //pdfoverlap width of screen
  double hm; //top height
  double wm; //left width
  ContractOperation _dbContractOp = ContractOperation();
  PDFViewController pdfViewController;
  var key = GlobalKey<FormState>();
  var currentitemselected = "Sign";
  var itemlist = ["Sign", "Send"];
  bool issend = false;
  bool first = true;
  var scale = 1.0;
  bool iszoom = false;
  String errorMessage = "";
  bool isstart = false;
  Set colorsview = {};
  Set allusers = {};
  bool isdownloading = false;
  bool isSubmitting = false;

  @override
  void initState() {
    WidgetsBinding.instance
        .addPostFrameCallback((timeStamp) => getsizeposition());
    // isdownloading = true;
    // print("check ${_contracts.send}");
    // print("con ${_contracts.signDocUrl}");
    // downloadSpecificDoc(_contracts.signDocUrl).then((value) => {
    //       if (value != null)
    //         {
    //           setState(() => {
    //                 _contracts.filePath = value.path,
    //               })
    //         }
    //       else
    //         {
    //           setState(() => {_contracts = _contracts, isdownloading = false})
    //         }
    //     });
    super.initState();
  }

  Future _getpdfsize(List px1, List px2, List py1, List py2, double pdfow,
      double pdfoh) async {
    screenhp = await pdfViewController.getScreenHeight();
    screenwp = await pdfViewController.getScreenWidth();
    pageh = await pdfViewController.getPageHeight(indexpages);
    pagew = await pdfViewController.getPageWidth(indexpages);
    if (first == true) {
      setState(() {
        screenpdfoh = pdfscreensize.height * (pageh / screenhp);

        screenpdfow = pdfscreensize.width * (pagew / screenwp);

        hm = (pdfscreensize.height - screenpdfoh) / 2;

        wm = (pdfscreensize.width - screenpdfow) / 2;

        for (int i = 0; i < px1.length; i++) {
          x1.add((px1[i] * (screenpdfow / pdfow)) + wm);
          x2.add((px2[i] * (screenpdfow / pdfow)) + wm);
          y1.add((py1[i] * (screenpdfoh / pdfoh)) + hm);
          y2.add((py2[i] * (screenpdfoh / pdfoh)) + hm);
        }

        first = false;
      });
    }
  }

  getsizeposition() {
    RenderBox pdfbox = pdfkey.currentContext.findRenderObject();
    pdfscreensize = pdfbox.size;
    pdfposition = pdfbox.localToGlobal(Offset.zero);
  }

  @override
  Widget build(BuildContext context) {
    List emails = allusers.toList();
    int count = allusers.length;
    List colorsemail = colorsview.toList();
    // final name = basename(widget.file!.path);
    final text = '${indexpages + 1} of $pages';
    double pdfoh = jsonDecode(_contracts.document["properties"])["height"];
    double pdfow = jsonDecode(_contracts.document["properties"])["width"];
    List indexpage = [];
    List px1 = [];
    List px2 = [];
    List py1 = [];
    List py2 = [];
    List colorbox = [];

    for (int i = 0; i < _contracts.annotations.length; i++) {
      setState(() {
        colorsview.add(_contracts.annotations[i]["color"]);
        allusers.add(_contracts.annotations[i]["signer"]);
        if (_contracts.annotations[i]["signer"] == _usermodel.email) {
          colorbox.add(_contracts.annotations[i]["color"]);
          indexpage.add(_contracts.annotations[i]["page"]);

          px1.add(_contracts.annotations[i]["x1"]);
          px2.add(_contracts.annotations[i]["x2"]);
          py1.add(_contracts.annotations[i]["y1"]);
          py2.add(_contracts.annotations[i]["y2"]);
        }
      });
    }

    showBottomList() {
      return Container(
        padding: const EdgeInsets.only(top: 10, left: 5),
        margin: const EdgeInsets.only(left: 5, bottom: 42, right: 100),
        color: Colors.white,
        child: ListView.builder(
            shrinkWrap: true,
            itemCount: emails.length,
            itemBuilder: (context, index) {
              return Container(
                margin: const EdgeInsets.all(5),
                child: Text("${index + 1}.  ${emails[index]}"),
              );
            }),
      );
    }

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        leading: IconButton(
            onPressed: () {
              Navigator.pop(context);
            },
            icon: Icon(Icons.arrow_back_ios_new)),
        title: Text("${_contracts.contractName}"),
        backgroundColor: kprimaryColor,
        centerTitle: true,
        actions: [
          // signPng != null
          isSigned
              ? Center(
                  child: !isSubmitting
                      ? IconButton(
                          onPressed: () async {
                            setState(() {
                              isSubmitting = true;
                            });
                            ServerOp(
                                    apiKey: _usermodel.apiKey, context: context)
                                .sign(signPng.path, _contracts.uuid)
                                .then((value) => {
                                      if (value != null)
                                        {
                                          // _dbContractOp
                                          //     .update(_contracts)
                                          ServerOp(
                                                  apiKey: _usermodel.apiKey,
                                                  context: context)
                                              .getContractByUuid(
                                                  sent: _contracts.send,
                                                  uuid: _contracts.uuid,
                                                  contractModel: _contracts)
                                              .then((value) => {
                                                    setState(() {
                                                      isSubmitting = true;
                                                    }),
                                                    // Navigator.pushAndRemoveUntil(
                                                    //     context,
                                                    //     MaterialPageRoute(
                                                    //         builder:
                                                    //             (context) =>
                                                    //                 HomeScreen()),
                                                    //     (route) =>
                                                    //         false)
                                                    Navigator.pop(
                                                        context, value)
                                                  })
                                        }
                                      else
                                        {
                                          setState(() {
                                            isSubmitting = false;
                                          })
                                        }
                                    });
                          },
                          icon: Icon(
                            Icons.send,
                            size: 30,
                            color: Colors.white,
                          ))
                      : Container(
                          height: 30,
                          width: 30,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 3,
                          ),
                        ))
              : SizedBox(),
          SizedBox(
            width: 15,
          )

          // ? Container(
          //     alignment: Alignment.center,
          //     padding: const EdgeInsets.symmetric(horizontal: 13),
          //     color: Colors.white70,
          //     margin: const EdgeInsets.only(right: 15, top: 8, bottom: 8),
          //     child: DropdownButton<String>(
          //       underline: Container(),
          //       style: TextStyle(fontSize: 18, color: Colors.black),
          //       iconSize: 30,
          //       iconEnabledColor: Colors.black,
          //       //icon: Icon(Icons.arrow_drop_down),
          //       items: itemlist
          //           .map((String list) => DropdownMenuItem(
          //                 value: list,
          //                 child: Text(list),
          //               ))
          //           .toList(),
          //       value: currentitemselected,
          //       onChanged: (String newitem) {
          //         setState(() {
          //           currentitemselected = newitem;
          //           if (newitem == "Send") {
          //             issend = true;
          //             itemlist = ["Send", "Sign"];
          //           } else if (newitem == "Sign") {
          //             issend = false;
          //             itemlist = ["Sign", "Send"];
          //           }
          //         });
          //       },
          //     ),
          //   )
          // : null
        ],
      ),
      body: Column(
        children: [
          Container(
              margin: const EdgeInsets.all(10),
              height: 60,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Flexible(
                    flex: 5,
                    child: Container(
                      margin: const EdgeInsets.only(left: 10),
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: count,
                        itemBuilder: (context, i) => new Container(
                          margin: const EdgeInsets.only(right: 10),
                          child: CircleAvatar(
                              radius: 25,
                              backgroundColor: Color(int.parse(
                                      colorsemail[i]
                                          .toUpperCase()
                                          .replaceAll("#", ""),
                                      radix: 16) +
                                  0xFF000000),
                              child: Center(
                                  child: Text(
                                "${emails[i].toString().substring(0, 2)}",
                              ))),
                        ),
                      ),
                    ),
                  ),
                  Flexible(
                    child: Container(
                        alignment: Alignment.centerRight,
                        margin: const EdgeInsets.only(left: 5),
                        child:
                            //  issend
                            // ? !isSubmitting
                            //     ? IconButton(
                            //         onPressed: () async {
                            //           setState(() {
                            //             isSubmitting = true;
                            //           });
                            //           ServerOp(
                            //                   apiKey: _usermodel.apiKey,
                            //                   context: context)
                            //               .sign(signPng.path, _contracts.uuid)
                            //               .then((value) => {
                            //                     if (value != null)
                            //                       {
                            //                         // _dbContractOp
                            //                         //     .update(_contracts)
                            //                         ServerOp(
                            //                                 apiKey: _usermodel
                            //                                     .apiKey,
                            //                                 context: context)
                            //                             .getContractByUuid(
                            //                                 sent:
                            //                                     _contracts.send,
                            //                                 uuid:
                            //                                     _contracts.uuid,
                            //                                 contractModel:
                            //                                     _contracts)
                            //                             .then((value) => {
                            //                                   setState(() {
                            //                                     isSubmitting =
                            //                                         true;
                            //                                   }),
                            //                                   // Navigator.pushAndRemoveUntil(
                            //                                   //     context,
                            //                                   //     MaterialPageRoute(
                            //                                   //         builder:
                            //                                   //             (context) =>
                            //                                   //                 HomeScreen()),
                            //                                   //     (route) =>
                            //                                   //         false)
                            //                                   Navigator.pop(
                            //                                       context,
                            //                                       value)
                            //                                 })
                            //                       }
                            //                     else
                            //                       {
                            //                         setState(() {
                            //                           isSubmitting = false;
                            //                         })
                            //                       }
                            //                   });
                            //         },
                            //         icon: Icon(
                            //           Icons.check_circle_outline_rounded,
                            //           size: 40,
                            //           color: kprimaryColor,
                            //         ))
                            //     : CircularProgressIndicator()
                            // :
                            IconButton(
                                onPressed: () {
                                  Future saved = Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (context) => Signaturee()));
                                  saved.then((value) {
                                    if (value != null) {
                                      setState(() {
                                        signPng = value;
                                        isSigned = true;
                                      });
                                    }
                                  });
                                },
                                icon: Icon(
                                  FontAwesomeIcons.signature,
                                  size: 30,
                                ))),
                  ),
                ],
              )),
          Expanded(
            key: pdfkey,
            child: isdownloading
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          color: kprimaryColor,
                        ),
                        SizedBox(height: 20),
                        downloadprogress != null
                            ? Text("$downloadprogress%")
                            : Text("0%"),
                      ],
                    ),
                  )
                : Stack(
                    children: [
                      PDFView(
                        swipeHorizontal: true,
                        filePath: _contracts.filePath,
                        //pageFling: false,

                        onRender: (pages) {
                          return setState(() {
                            this.pages = pages;

                            isstart = true;
                          });
                        },
                        onError: (error) {
                          setState(() {
                            errorMessage = error;
                            isdownloading = true;
                            downloadSpecificDoc(_contracts.signDocUrl)
                                .then((value) {
                              setState(() {
                                _contracts.filePath = value.path;
                                isdownloading = false;
                              });
                              // Navigator.pushReplacement(
                              //     context,
                              //     MaterialPageRoute(
                              //         builder: (context) => SEmployee(
                              //               contractmodel: _contracts,
                              //             )));
                            });
                          });
                        },

                        onViewCreated: (pdfViewController) {
                          return setState(
                              () => this.pdfViewController = pdfViewController);
                        },
                        onPageChanged: (indexpages, _) => setState(
                          () {
                            this.indexpages = indexpages;
                            _getpdfsize(px1, px2, py1, py2, pdfow, pdfoh);
                          },
                        ),
                        onZoomChanged: (double zoom) {
                          if (scale != zoom) {
                            setState(() {
                              iszoom = true;
                            });
                          } else {
                            setState(() {
                              iszoom = false;
                            });
                          }
                        },
                      ),
                      errorMessage.isEmpty && downloadprogress != 100
                          ? !isstart
                              ? Center(
                                  child: CircularProgressIndicator(
                                    color: kprimaryColor,
                                  ),
                                )
                              : Container()
                          : Center(
                              child: isdownloading
                                  ? Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        CircularProgressIndicator(
                                          color: kprimaryColor,
                                        ),
                                        SizedBox(height: 20),
                                        downloadprogress != null
                                            ? Text("$downloadprogress%")
                                            : Text("0%"),
                                      ],
                                    )
                                  : SizedBox()),
                      if (pages != 0)
                        if (indexpage != null)
                          for (int i = 0; i < x1.length; i++)
                            if (iszoom == false)
                              indexpage[i] == indexpages
                                  ? Positioned(
                                      bottom: y1[i],
                                      left: x1[i],
                                      child: InkWell(
                                        onLongPress: () {
                                          signPng != null
                                              ? showDialog(
                                                  context: context,
                                                  builder: (context) =>
                                                      AlertDialog(
                                                          title: IconButton(
                                                              onPressed: () {
                                                                Navigator.pop(
                                                                    context);
                                                              },
                                                              icon: Icon(
                                                                  Icons.clear)),
                                                          content: Image.file(
                                                              signPng)))
                                              : print("nothing");
                                        },
                                        child: Container(
                                          height: y2[i] - y1[i],
                                          width: x2[i] - x1[i],
                                          decoration: BoxDecoration(
                                            border: Border.all(
                                              color: Color(int.parse(
                                                      colorbox[i]
                                                          .toUpperCase()
                                                          .replaceAll("#", ""),
                                                      radix: 16) +
                                                  0xFF000000),
                                            ),
                                          ),
                                          child: signPng != null
                                              ? Image(
                                                  image: FileImage(signPng),
                                                  fit: BoxFit.scaleDown,
                                                )
                                              : Container(),
                                        ),
                                      ))
                                  : Container(),
                      iszoom
                          ? Positioned(
                              right: 20,
                              bottom: 20,
                              child: InkWell(
                                onTap: () {
                                  pdfViewController.resetZoom(indexpages);
                                  iszoom = false;
                                },
                                child: CircleAvatar(
                                  radius: 25,
                                  backgroundColor: kprimaryColor,
                                  child: Icon(
                                    Icons.zoom_out,
                                    // color: kprimaryColor,
                                  ),
                                ),
                              ))
                          : SizedBox(),
                    ],
                  ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              InkWell(
                onTap: () => showModalBottomSheet(
                    context: context,
                    backgroundColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(12),
                            topRight: Radius.circular(12))),
                    builder: (context) => showBottomList()),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(left: 20),
                      child: Text("Signer List"),
                    ),
                    Container(child: Icon(Icons.arrow_drop_up_sharp))
                  ],
                ),
              ),
              pages == 0
                  ? Container(
                      margin:
                          const EdgeInsets.only(top: 10, bottom: 10, right: 20),
                      alignment: Alignment.bottomRight,
                      child: Text("0 of 0"))
                  : Container(
                      margin:
                          const EdgeInsets.only(top: 10, bottom: 10, right: 20),
                      alignment: Alignment.bottomRight,
                      child: Text(text)),
            ],
          )
        ],
      ),
    );
  }

  Future downloadSpecificDoc(String url) async {
    try {
      final response = await dio.get(url, onReceiveProgress: (received, total) {
        setState(() {
          // downloadprogress=((received / total * 100).toStringAsFixed(0) + "%");
          downloadprogress = ((received / total) * 100).toInt();
        });
        print(downloadprogress);

        if (downloadprogress == 100) {
          setState(() {
            isdownloading = false;
          });
        }
      },
          options: Options(
            responseType: ResponseType.bytes,
          ));

      if (response.statusCode == 200) {
        final bytes = response.data;
        return storeFile(url, bytes);
      } else if (response.statusCode != 200 || response == null) {
        return null;
      }
    } catch (e) {
      print(e);
      return null;
    }
  }

  Future<File> storeFile(String url, List<int> bytes) async {
    final filename = basename(url);
    final file = File('${_appDir.path}/$filename');
    await file.writeAsBytes(bytes, flush: true);
    return file;
  }
}
