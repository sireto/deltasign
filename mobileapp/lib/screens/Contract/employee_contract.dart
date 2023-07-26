import 'dart:io';
//import 'package:dio/dio.dart';

import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:delta_sign/config/size_config.dart';
import 'package:delta_sign/database/server_operation.dart';
import 'package:delta_sign/models/annotation.dart';
import 'package:delta_sign/models/document_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:delta_sign/screens/homescreen/home_screen.dart';
import 'package:delta_sign/validation.dart';
import 'package:dio/dio.dart';

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get_it/get_it.dart';
import 'package:flutter_fullpdfview_fork/flutter_fullpdfview_fork.dart';
import 'package:path/path.dart';

import '../../themes.dart';

class CreateContract extends StatefulWidget {
  final DocumentModel documentModel;
  final String contractName;
  const CreateContract(
      {Key key, @required this.documentModel, @required this.contractName})
      : super(key: key);

  @override
  _CreateContractState createState() => _CreateContractState(documentModel);
}

class _CreateContractState extends State<CreateContract> {
  DocumentModel _documentModel;
  _CreateContractState(this._documentModel);
  final GlobalKey pdfkey = GlobalKey();
  Size pdfscreensize;
  Dio dio = new Dio();
  Directory _appDir = GetIt.I.get();
  int downloadprogress;
  Offset pdfposition;
  UserModel _userModel = GetIt.I.get();
  FocusNode _emailFocusNode = FocusNode();
  FocusNode _descriptionFocusNode = FocusNode();
  int count = 0; //generate number circle
  int pages = 0;
  int indexpages = 0;
  int currenttab = 0; //for colorselection
  int ref = 0; //for increasing decreasing page
  double scale = 1.0;
  double previous = 1.0;
  bool isloading = false;
  PDFViewController pdfViewController;
  List<bool> clicked = List.filled(100, false, growable: true);
  bool clickk = false; //for viewing box first time null safety
  List indexpagess = []; //add indexpage for api
  List email = []; //add email for api
  List emails = []; //add email for bottom sheet
  bool isemail = false;
  List<double> x1 = [];
  List<double> x2 = [];
  List<double> y1 = [];
  List<double> y2 = [];
  var fontc = List.filled(10, Colors.white,
      growable: true); //font color forselected or not
  Map<String, List<double>> dimension = {}; //dimension for api
  Annotationn annotationn;
  TextEditingController textEditingController = TextEditingController();

  var key = GlobalKey<FormState>(); //key for form
  final offset1 = List.filled(100, Offset(150, 315),
      growable: true); //default offset starting offset
  var offset = []; //changing offset as drag
  TextEditingController textEditingControllerdes = TextEditingController();
  bool iszoom = false;
  var lengthe; //for delete
  List colorhexx = [];
  double pageh; //height of page from pdf view library
  double pagew; //width of screen from pdf view library
  double screenhp; //height of screen from pdf view library
  double screenwp; //width of screen from pdf view library
  double screenpdfoh; //pdfoverlap height of screen
  double screenpdfow; //pdfoverlap width of screen
  double hm; //top height
  double wm; //left width
  // double pdforiginalheight = 612; //pdf original height
  // double pdforiginalwidth = 792; //pdf original width
  var colorsview = [];
  var colorsvieworiginal = [
    Colors.blue,
    Colors.red,
    Colors.brown,
    Colors.cyan,
    Colors.grey,
    Colors.indigo,
    Colors.pink,
    Colors.orange,
    Colors.green,
    Colors.yellow,
  ];
  bool isdownloading = false;
  bool isstart = false;
  String errorMessage = "";

  @override
  void dispose() {
    textEditingController.dispose();
    textEditingControllerdes.dispose();
    _emailFocusNode.dispose();
    _descriptionFocusNode.dispose();
    super.dispose();
  }

  // Future _getsize;
  @override
  void initState() {
    // getpdf();

    super.initState();
    WidgetsBinding.instance
        .addPostFrameCallback((timeStamp) => getsizeposition());
  }

  Future _getpdfsize() async {
    screenhp = await pdfViewController.getScreenHeight();
    screenwp = await pdfViewController.getScreenWidth();
    pageh = await pdfViewController.getPageHeight(indexpages);
    pagew = await pdfViewController.getPageWidth(indexpages);
  }

  getsizeposition() {
    RenderBox pdfbox = pdfkey.currentContext.findRenderObject();
    pdfscreensize = pdfbox.size;
    pdfposition = pdfbox.localToGlobal(Offset.zero);
    // print(pdfposition);
  }

  @override
  Widget build(BuildContext context) {
    final text = '${indexpages + 1} of $pages'; //page no
    //color selection for sign adder

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: Text(widget.contractName),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        backgroundColor: kprimaryColor,
        // centerTitle: false,
        actions: [
          Container(
              margin: const EdgeInsets.only(right: 10),
              child: IconButton(
                  icon: Icon(
                    Icons.send,
                  ),
                  onPressed: () {
                    // Navigator.push(
                    //     context,
                    //     MaterialPageRoute(
                    //         builder: (context) => SEmployee(
                    //               file: widget.file,
                    //               filename: widget.filename,
                    //             )));
                    if (emails.isEmpty) {
                      Fluttertoast.showToast(
                          msg: "Add a signer \n press Add icon to add signer",
                          toastLength: Toast.LENGTH_SHORT,
                          gravity: ToastGravity.BOTTOM);
                    } else if (dimension.isEmpty) {
                      Fluttertoast.showToast(
                          msg:
                              "Add annotation \n press on signer to add annotation",
                          toastLength: Toast.LENGTH_SHORT,
                          gravity: ToastGravity.BOTTOM);
                    } else if (emails.isNotEmpty && dimension.isNotEmpty) {
                      _descriptionFocusNode.requestFocus();
                      showModalBottomSheet(
                          isScrollControlled: true,
                          enableDrag: false,
                          context: this.context,
                          useRootNavigator: false,
                          backgroundColor: Colors.transparent,
                          builder: (context) => StatefulBuilder(
                              builder: (BuildContext context,
                                      StateSetter setState) =>
                                  bottomsheetviewsend(setState)));
                    } else {
                      Fluttertoast.showToast(
                          msg: "Error",
                          toastLength: Toast.LENGTH_SHORT,
                          gravity: ToastGravity.BOTTOM);
                    }
                  }))
        ],
      ),
      body: Column(
        children: [
          //add_show
          Container(
              margin: const EdgeInsets.all(10),
              height: 60,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Container(
                    width: SizeConfig.screenWidth * 0.75,
                    margin: const EdgeInsets.only(left: 10),
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: count,
                      itemBuilder: (context, i) => InkWell(
                        onLongPress: () {
                          //delete warning dialog
                          showDialog(
                              context: this.context,
                              builder: (context) => deleteclient(i));
                        },
                        onTap: () {
                          setState(() {
                            clicked[i] = true;
                            fontc[i] = Colors.black;
                            clickk = true;
                            screenpdfoh =
                                pdfscreensize.height * (pageh / screenhp);

                            screenpdfow =
                                pdfscreensize.width * (pagew / screenwp);

                            hm = (pdfscreensize.height - screenpdfoh) / 2;
                            wm = (pdfscreensize.width - screenpdfow) / 2;

                            indexpagess.add(indexpages + 1);
                            email.add(emails[i]);
                            offset.add(offset1[i]);
                            x1.add((offset1[i].dx - wm) *
                                (_documentModel.properties["width"] /
                                    screenpdfow));
                            x2.add((offset1[i].dx + 60 - wm) *
                                (_documentModel.properties["width"] /
                                    screenpdfow));
                            y1.add(_documentModel.properties["height"] -
                                (offset1[i].dy - 160 - hm) *
                                    (_documentModel.properties["height"] /
                                        screenpdfoh));
                            y2.add(_documentModel.properties["height"] -
                                (offset1[i].dy - 140 - hm) *
                                    (_documentModel.properties["height"] /
                                        screenpdfoh));
                            dimension.addAll({
                              'x1': x1,
                              'x2': x2,
                              'y1': y1,
                              'y2': y2,
                            });

                            colorhexx.add(
                                "#${colorsview[i].value.toRadixString(16).substring(2)}");
                            annotationn = new Annotationn(
                                indexpagess, email, dimension, colorhexx);

                            //clicked[i]=!clicked[i];
                            // indexpagess[indexpages] =!indexpagess[indexpages];
                            // print(clicked);
                            // print(offset1);
                          });
                        },
                        child: new Container(
                          margin: const EdgeInsets.only(right: 10),
                          child: CircleAvatar(
                              radius: 25,
                              backgroundColor: colorsview[i],
                              child: Center(
                                  child: Text(
                                "${emails[i].toString().substring(0, 2)}",
                                style: TextStyle(color: fontc[i]),
                              ))),
                        ),
                      ),
                    ),
                  ),
                  InkWell(
                    onTap: () {
                      _emailFocusNode.requestFocus();
                      showModalBottomSheet(
                          isScrollControlled: true,
                          context: this.context,
                          useRootNavigator: false,
                          enableDrag: false,
                          backgroundColor: Colors.transparent,
                          builder: (context) => showbottomsheetclient());
                    },
                    child: Container(
                        margin: const EdgeInsets.only(left: 5),
                        width: SizeConfig.screenWidth * 0.1,
                        child: Icon(
                          Icons.add_circle_outline_rounded,
                          color: kprimaryColor,
                          size: 50,
                        )),
                  ),
                ],
              )),
          pdf(),
          //pdf
          //page
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              isemail
                  ? InkWell(
                      onTap: () {
                        showModalBottomSheet(
                            context: context,
                            backgroundColor: Colors.transparent,
                            enableDrag: false,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(2.0)
                                // topLeft: Radius.circular(12),
                                // topRight: Radius.circular(12)
                                ),
                            builder: (context) => showBottomList()
                            // DraggableScrollableSheet(
                            //       initialChildSize: 0.4,
                            //       minChildSize: 0.3,
                            //       maxChildSize: 0.9,
                            //       builder: (context, controller) =>

                            );
                      },
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
                    )
                  : Container(),
              Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 10, right: 20),
                  alignment: Alignment.bottomRight,
                  child: pages != 0 ? Text(text) : Text("0 of 0")),
            ],
          )
        ],
      ),
    );
  }

  deleteclient(int i) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        alignment: Alignment.topCenter,
        clipBehavior: Clip.none,
        children: [
          Positioned(
              top: -40,
              child: CircleAvatar(
                backgroundColor: Colors.redAccent,
                radius: 40,
                child: Icon(
                  Icons.warning,
                  size: 30,
                  color: Colors.white,
                ),
              )),
          Container(
            height: 180,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(30, 40, 30, 10),
              child: Column(
                children: [
                  SizedBox(height: 10),
                  Center(
                      child: Text(
                    "Delete client",
                    style: TextStyle(fontSize: 20),
                  )),
                  SizedBox(height: 5),
                  Center(child: Text("${emails[i]} ?")),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ElevatedButton(
                          onPressed: () {
                            setState(() {
                              count--;
                              clicked.removeAt(i);
                              fontc.removeAt(i);

                              if (email.length != 0) {
                                setState(() {
                                  lengthe = annotationn.email.length;
                                });

                                for (int k = 0; k < lengthe; k++) {
                                  for (int j = 0;
                                      j < annotationn.email.length;
                                      j++) {
                                    if (annotationn.email[j] == emails[i]) {
                                      annotationn.email.removeAt(j);
                                      annotationn.indexpages.removeAt(j);
                                      annotationn.dimension
                                          .forEach((key, value) {
                                        value.removeAt(j);
                                      });
                                      annotationn.color.removeAt(j);
                                    }
                                  }
                                }
                              }
                              if (emails.length == 1) {
                                isemail = false;
                              }
                              emails.removeAt(i);
                            });
                            Navigator.pop(this.context);
                          },
                          child: Text("Yes")),
                      ElevatedButton(
                          onPressed: () {
                            Navigator.pop(this.context);
                          },
                          child: Text("No")),
                    ],
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  //siger add

  showbottomsheetclient() {
    return Padding(
      padding: MediaQuery.of(this.context).viewInsets,
      child: Container(
        margin: EdgeInsets.all(5),
        padding: EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(12)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              children: [
                Container(
                  alignment: Alignment.topRight,
                  child: IconButton(
                    onPressed: () {
                      textEditingController.clear();
                      Navigator.pop(this.context);
                    },
                    icon: Icon(
                      Icons.clear_rounded,
                      size: 28,
                    ),
                  ),
                ),
                Container(
                    alignment: Alignment.center,
                    padding: const EdgeInsets.only(top: 5),
                    child: Text(
                      "Add a signer",
                      style: TextStyle(fontSize: 20),
                    )),
              ],
            ),
            Container(
              margin: const EdgeInsets.all(10),
              child: Form(
                key: key,
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      Container(
                        width: SizeConfig.screenWidth * 0.8,
                        padding: EdgeInsets.symmetric(horizontal: 3),
                        child: TextFormField(
                            controller: textEditingController,
                            focusNode: _emailFocusNode,
                            validator: (value) {
                              if (value.isEmpty) {
                                return "Field must not be empty";
                              } else if (emails.contains(value)) {
                                return kRepateEmailError;
                              } else if (!emailValidatorRegExp
                                  .hasMatch(value)) {
                                return kInvalidEmailError;
                              }
                              return null;
                            },
                            decoration: InputDecoration(
                                isDense: true,
                                contentPadding: EdgeInsets.all(18),
                                hintText: "Enter email of signer",
                                focusedBorder: OutlineInputBorder(
                                    borderSide:
                                        BorderSide(color: kprimaryColor),
                                    borderRadius: BorderRadius.circular(12)),
                                border: OutlineInputBorder(
                                    borderSide:
                                        BorderSide(color: kprimaryColor),
                                    borderRadius: BorderRadius.circular(12)))),
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      Container(
                          height: 40,
                          width: SizeConfig.screenWidth * 0.4,
                          margin: const EdgeInsets.only(top: 10),
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              primary: kprimaryColor,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                            ),
                            onPressed: () {
                              if (key.currentState.validate()) {
                                setState(() {
                                  if (colorsview.length == 0) {
                                    colorsview.addAll(colorsvieworiginal);
                                  } else if (emails.length ==
                                      colorsview.length - 1) {
                                    colorsview.addAll(colorsvieworiginal);
                                  }
                                  print(colorsview);
                                  count++;
                                  fontc.add(Colors.white);
                                  emails.add(textEditingController.text);
                                  textEditingController.clear();
                                  isemail = true;
                                  Navigator.pop(this.context);
                                });
                              }
                            },
                            child: Text("Save"),
                          ))
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

  deletebox(int i) {
    return Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.topCenter,
          children: [
            Positioned(
                top: -40,
                child: CircleAvatar(
                  radius: 40,
                  backgroundColor: Colors.redAccent,
                  child: Icon(Icons.warning, size: 30, color: Colors.white),
                )),
            Container(
              height: 170,
              child: Padding(
                  padding: const EdgeInsets.fromLTRB(30, 40, 30, 10),
                  child: Column(
                    children: [
                      SizedBox(height: 10),
                      Center(
                          child: Text(
                        "Delete the box?",
                        style: TextStyle(fontSize: 20),
                      )),
                      SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  annotationn.email.removeAt(i);
                                  annotationn.indexpages.removeAt(i);
                                  annotationn.color.removeAt(i);
                                  annotationn.dimension.forEach((key, value) {
                                    value.removeAt(i);
                                  });
                                  offset.removeAt(i);
                                });
                                Navigator.pop(this.context);
                              },
                              child: Text("Yes")),
                          ElevatedButton(
                              onPressed: () {
                                Navigator.pop(this.context);
                              },
                              child: Text("No")),
                        ],
                      )
                    ],
                  )),
            )
          ],
        ));
  }

  pdf() => Expanded(
        child: Stack(
          key: pdfkey,
          children: [
            PDFView(
              swipeHorizontal: true,
              filePath: _documentModel.filePath,
              fitPolicy: FitPolicy.BOTH,
              onError: (error) {
                setState(() {
                  errorMessage = error.toString();
                  isdownloading = true;
                  downloadSpecificDoc(_documentModel.pdfLink).then((value) {
                    // Navigator.pushReplacement(
                    //     this.context,
                    //     MaterialPageRoute(
                    //         builder: (context) => CreateContract(
                    //               documentModel: _documentModel,
                    //             )));
                    setState(() {
                      _documentModel.filePath = value.path;
                    });
                  });
                });
              },
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
              onRender: (pages) => setState(() {
                this.pages = pages;
                isstart = true;
              }),
              onPageChanged: (indexpages, _) => setState(() {
                this.indexpages = indexpages;
                _getpdfsize();
              }),
              onViewCreated: (pdfViewController) => setState(
                () {
                  this.pdfViewController = pdfViewController;
                },
              ),
            ),
            errorMessage.isEmpty
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
                          )
                        : SizedBox()),
            //),
            if (iszoom == false)
              for (var j = 0; j < count; j++)
                if (clicked[j] == true && clickk == true)
                  for (var i = 0; i < annotationn.indexpages.length; i++)
                    if (emails[j] == annotationn.email[i])
                      Positioned(
                        top: annotationn.indexpages[i] == indexpages + 1
                            ? offset[i].dy - 168
                            : (offset[i].dy) + 2000,
                        left: annotationn.indexpages[i] == indexpages + 1
                            ? offset[i].dx
                            : (offset[i].dx) + 2000,
                        child: Draggable(
                          feedback: Container(
                            height: 20,
                            width: 60,
                            decoration: BoxDecoration(
                              border: Border.all(color: colorsview[j]),
                            ),
                            child: Center(
                                child: Text(
                                    emails[j].toString().substring(0, 2),
                                    style: TextStyle(
                                        fontSize: 15, color: colorsview[j]))),
                          ),
                          child: InkWell(
                            onLongPress: () {
                              showDialog(
                                  context: this.context,
                                  builder: (context) => deletebox(i));
                            },
                            child: Container(
                              height: 20,
                              width: 60,
                              decoration: BoxDecoration(
                                border: Border.all(color: colorsview[j]),
                              ),
                              child: Center(
                                  child:
                                      Text(emails[j].toString().substring(0, 2),
                                          style: TextStyle(
                                            fontSize: 6,
                                            color: colorsview[j],
                                          ))),
                            ),
                          ),
                          onDraggableCanceled: (v, o) {
                            setState(() {
                              offset[i] = o;
                              //offset1.remove(i);
                              //print(offset1);

                              x1[i] = (offset[i].dx - wm) *
                                  (_documentModel.properties["width"] /
                                      screenpdfow);
                              x2[i] = (offset[i].dx + 60 - wm) *
                                  (_documentModel.properties["width"] /
                                      screenpdfow);
                              y1[i] = _documentModel.properties["height"] -
                                  (offset[i].dy - 148 - hm) *
                                      (_documentModel.properties["height"] /
                                          screenpdfoh);
                              y2[i] = _documentModel.properties["height"] -
                                  (offset[i].dy - 168 - hm) *
                                      (_documentModel.properties["height"] /
                                          screenpdfoh);
                            });
                          },
                        ),
                      ),
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
                          //color: kprimaryColor,
                        ),
                      ),
                    ))
                : SizedBox(),

            // : Container(),
          ],
        ),
      );
  showBottomList() {
    return Container(
      padding: const EdgeInsets.all(8.0),
      margin: const EdgeInsets.only(left: 5, bottom: 32, right: 100),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(2.0)),
      child: ListView.builder(
          shrinkWrap: true,
          //controller: controller,
          itemCount: emails.length,
          itemBuilder: (context, index) {
            return Container(
              margin: const EdgeInsets.all(5),
              child: Text("${index + 1}.  ${emails[index]}"),
            );
          }),
    );
  }

  Future _send(
    StateSetter setState,
  ) async {
    try {
      var value =
          await ServerOp(apiKey: _userModel.apiKey, context: this.context)
              .sendContract(
                  _documentModel.uuid,
                  annotationn.email.toSet(),
                  annotationn.value(),
                  textEditingControllerdes.text,
                  _documentModel.filePath,
                  widget.contractName);
      if (value != null) {
        Fluttertoast.showToast(
            msg: "Contract created",
            gravity: ToastGravity.BOTTOM,
            toastLength: Toast.LENGTH_SHORT);
        // Navigator.pop(this.context);
        // Navigator.pop(this.context);
        Navigator.pushAndRemoveUntil(
            this.context,
            MaterialPageRoute(builder: (context) => HomeScreen()),
            (route) => false);
      } else {
        setState(() {
          isloading = false;
          Fluttertoast.showToast(
              msg: "Failed",
              gravity: ToastGravity.BOTTOM,
              toastLength: Toast.LENGTH_SHORT);
        });
      }
    } catch (e) {
      print(e);
    }
  }

  bottomsheetviewsend(StateSetter setState) {
    return Padding(
      padding: MediaQuery.of(this.context).viewInsets,
      child: Form(
        key: key,
        child: Container(
          margin: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  children: [
                    Container(
                      margin: const EdgeInsets.only(right: 10),
                      alignment: Alignment.topRight,
                      child: InkWell(
                        onTap: () {
                          textEditingControllerdes.clear();

                          Navigator.pop(this.context);
                        },
                        child: Icon(
                          Icons.clear_rounded,
                          size: 28,
                        ),
                      ),
                    ),
                    Center(
                      child: Container(
                          // margin:const EdgeInsets.only(left:30),
                          // width: SizeConfig.screenWidth * 0.4,
                          padding: const EdgeInsets.only(top: 5),
                          child: Text(
                            "Description",
                            style: TextStyle(fontSize: 20),
                          )),
                    ),
                  ],
                ),
                // Container(
                //   margin: const EdgeInsets.only(right: 10),
                //   alignment: Alignment.topRight,
                //   child: Icon:Center(
                // child: CircularProgressIndicator(),Button(
                //     icon: Icon(
                //       Icons.clear,
                //       size: 30,
                //     ),
                //     onPressed: () {
                //       textEditingControllerdes.clear();
                //       Navigator.pop(this.context);
                //     },
                //   ),
                // ),
                Container(
                  margin: const EdgeInsets.only(
                      top: 10, left: 30, right: 30, bottom: 15),
                  height: 150,
                  child: TextFormField(
                      controller: textEditingControllerdes,
                      focusNode: _descriptionFocusNode,
                      validator: (value) {
                        if (value.isEmpty) {
                          return kDescriptionNullError;
                        }
                        return null;
                      },
                      maxLines: 10,
                      decoration: InputDecoration(
                          hintText: "Description",
                          focusedBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: kprimaryColor),
                              borderRadius: BorderRadius.circular(12)),
                          border: OutlineInputBorder(
                              borderSide: BorderSide(color: kprimaryColor),
                              borderRadius: BorderRadius.circular(12)))),
                ),
                Container(
                  width: SizeConfig.screenWidth * 0.3,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (key.currentState.validate() && !isloading) {
                        setState(() {
                          print("loading true");
                          isloading = true;
                          _send(setState);
                        });
                      }
                      //  Navigator.push(context, MaterialPageRoute(builder: (context)=>Ratio(height: rheight,width: rwidth,)));
                    },
                    child: Center(
                      child: isloading
                          ? Padding(
                              padding: const EdgeInsets.all(4.0),
                              child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white)),
                            )
                          : Text("Send"),
                    ),
                    style: ElevatedButton.styleFrom(
                      primary: kprimaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<File> downloadSpecificDoc(String url) async {
    final response = await dio.get(url, onReceiveProgress: (received, total) {
      setState(() {
        // downloadprogress=((received / total * 100).toStringAsFixed(0) + "%");
        downloadprogress = ((received / total) * 100).toInt();
      });
      if (downloadprogress == 100) {
        setState(() {
          isdownloading = false;
        });
      }
    },
        options: Options(
          responseType: ResponseType.bytes,
        ));
    final bytes = response.data;
    return storeFile(url, bytes);
  }

  Future<File> storeFile(String url, List<int> bytes) async {
    final filename = basename(url);
    final file = File('${_appDir.path}/$filename');

    await file.writeAsBytes(bytes, flush: true);
    return file;
  }

  // move() {
  //   if (indexpages > ref) {
  //     print(ref);
  //     print("increasing");
  //     print(indexpages);
  //     ref++;
  //   } else if (indexpages < ref) {
  //     print(ref);
  //     print("decreasing");
  //     print(indexpages);
  //     ref--;
  //   } else if (indexpages == 0) {
  //     print(ref);
  //     print("i am stable");
  //     print(indexpages);
  //   }
  // }
}
