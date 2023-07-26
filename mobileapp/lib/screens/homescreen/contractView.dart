import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'dart:ui';
import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_downloader/flutter_downloader.dart';
import 'package:flutter_fullpdfview_fork/flutter_fullpdfview_fork.dart';
import 'package:get_it/get_it.dart';
import 'package:path/path.dart';
import '../../themes.dart';

class ContractView extends StatefulWidget {
  final ContractModel contractModel;
  const ContractView({Key key, this.contractModel}) : super(key: key);

  @override
  _ContractViewState createState() => _ContractViewState(contractModel);
}

class _ContractViewState extends State<ContractView> {
  ContractModel _contractModel;
  _ContractViewState(this._contractModel);
  UserModel userModel = GetIt.I.get();
  Dio dio = new Dio();
  Directory _appDir = GetIt.I.get();
  int downloadprogress;
  bool isdownloading = false;
  bool isPdfDownloading = false;
  bool iszoom = false;
  double scale = 1.0;
  bool isstart = false;
  String errorMessage = "";
  double pageh; //height of page from pdf view library
  double pagew; //width of screen from pdf view library
  double screenhp; //height of screen from pdf view library
  double screenwp; //width of screen from pdf view library
  double screenpdfoh; //pdfoverlap height of screen
  double screenpdfow; //pdfoverlap width of screen
  double hm; //top height
  double wm;
  Size pdfscreensize;
  Offset pdfposition;
  List x1 = [];
  List y1 = [];
  List x2 = [];
  List y2 = [];
  Set colorsview = {};
  List allusers = [];
  String selectedUser;
  bool first = true;
  int pages = 0;
  final GlobalKey pdfkey = GlobalKey();
  int indexpages = 0;
  PDFViewController pdfViewController;
  int progressDownload = 0;
  ReceivePort _receivePort = ReceivePort();
  Directory directory = GetIt.I.get();

  static downloadingCallback(id, status, progress) {
    // Looking up for send port
    SendPort sendPort = IsolateNameServer.lookupPortByName("downloading");
    //  sending a data
    sendPort.send([id, status, progress]);
  }

  @override
  void initState() {
    WidgetsBinding.instance
        .addPostFrameCallback((timeStamp) => getsizeposition());
    // updateContract();
    // pdfRender();
    // register a send port for the otherisolates

    super.initState();
    IsolateNameServer.registerPortWithName(
        _receivePort.sendPort, 'downloading');
    // listening for the data
    _receivePort.listen((message) {
      setState(() {
        progressDownload = message[2];
        print(progressDownload);
        if (progressDownload == 100 || progressDownload == -1) {
          isPdfDownloading = false;
        }
      });
    });
    FlutterDownloader.registerCallback(downloadingCallback);
  }

  @override
  void dispose() {
    IsolateNameServer.removePortNameMapping('downloading');
    super.dispose();
  }

  // updateContract() async {
  //   // Map mapValue;
  //   await ServerOp(apiKey: userModel.apiKey)
  //       .getContractByUuid(uuid: _contractModel.uuid, sent: _contractModel.send)
  //       .then((value) => {
  //             if (value != null)
  //               {
  //                 //     print("controctmodel ${_contractModel.toMap()}"),
  //                 //     print("${_contractModel.id} contract"),
  //                 //     mapValue = {
  //                 //       'id': _contractModel.id,
  //                 //       'uuid': value['uuid'],
  //                 //       'document': value['document'],
  //                 //       'message': value['message'],
  //                 //       'created_date': value['created_date'],
  //                 //       'signers': value['signers'],
  //                 //       'annotations': value['annotations'],
  //                 //       'filePath': value['filePath'],
  //                 //       'signed_doc_url': value['signed_doc_url'],
  //                 //       'send': value['send']
  //                 //     },
  //                 setState(() => {
  //                       _contractModel = value,
  //                     }),
  //                 print(_contractModel),
  //                 pdfRender(),
  //               }
  //           });
  // }

  pdfRender() {
    isdownloading = true;
    downloadSpecificDoc(_contractModel.signDocUrl).then((value) => {
          if (value != null)
            {
              setState(() =>
                  {_contractModel.filePath = value.path, isdownloading = false})
            }
          else
            {
              setState(() =>
                  {_contractModel = _contractModel, isdownloading = false})
            }
        });
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

    // print(pdfposition);
  }

  @override
  Widget build(BuildContext context) {
    final text = '${indexpages + 1} of $pages';
    Set emaill = allusers.toSet();
    List emails = emaill.toList();
    int count = emails.length;
    List colorsemail = colorsview.toList();
    //String filename = basename(widget.url);
    // print(jsonDecode(_contractModel.document["properties"]));
    // print(_contracts[0].document["properties"];
    double pdfoh = jsonDecode(_contractModel.document["properties"])["height"];
    double pdfow = jsonDecode(_contractModel.document["properties"])["width"];
    List indexpage = [];
    List px1 = [];
    List px2 = [];
    List py1 = [];
    List py2 = [];
    List colorbox = [];

    if (selectedUser == null) {
      for (int i = 0; i < _contractModel.annotations.length; i++) {
        setState(() {
          colorsview.add(_contractModel.annotations[i]["color"]);
          allusers.add(_contractModel.annotations[i]["signer"]);
          colorbox.add(_contractModel.annotations[i]["color"]);
          indexpage.add(_contractModel.annotations[i]["page"]);
          //  print(indexpage);
          px1.add(_contractModel.annotations[i]["x1"]);
          px2.add(_contractModel.annotations[i]["x2"]);
          py1.add(_contractModel.annotations[i]["y1"]);
          py2.add(_contractModel.annotations[i]["y2"]);
        });
      }
    } else {
      // if (selectedUser == null) {
      //   setState(() {
      //     selectedUser = userModel.email;
      //   });
      // }
      for (int i = 0; i < _contractModel.annotations.length; i++) {
        setState(() {
          colorsview.add(_contractModel.annotations[i]["color"]);
          allusers.add(_contractModel.annotations[i]["signer"]);
          if (_contractModel.annotations[i]["signer"] == selectedUser) {
            colorbox.add(_contractModel.annotations[i]["color"]);
            indexpage.add(_contractModel.annotations[i]["page"]);

            px1.add(_contractModel.annotations[i]["x1"]);
            px2.add(_contractModel.annotations[i]["x2"]);
            py1.add(_contractModel.annotations[i]["y1"]);
            py2.add(_contractModel.annotations[i]["y2"]);
          }
        });
        if (first == true) {
          setState(() {
            _getpdfsize(px1, px2, py1, py2, pdfow, pdfoh);
          });
        }
      }
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(_contractModel.contractName),
        backwardsCompatibility: false,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        backgroundColor: kprimaryColor,
        actions: [
          !isPdfDownloading
              ? IconButton(
                  onPressed: () async {
                    // if (!isPdfDownload || progressDownload == 0) {
                    // final status = await Permission.storage.request();
                    // if (status.isGranted) {
                    setState(() {
                      isPdfDownloading = true;
                    });
                    // final externalDir =
                    //     await getApplicationDocumentsDirectory();
                    await FlutterDownloader.enqueue(
                        url: _contractModel.signDocUrl,
                        savedDir: directory.path,
                        fileName: "${_contractModel.contractName}.pdf",
                        showNotification: true,
                        saveInPublicStorage: true,
                        openFileFromNotification: true);
                    // } else {
                    //   Fluttertoast.showToast(
                    //       msg: "Permission Denied",
                    //       toastLength: Toast.LENGTH_SHORT,
                    //       gravity: ToastGravity.BOTTOM);
                    // }
                  },
                  // },
                  icon: Icon(
                    Icons.download,
                    size: 30,
                    color: Colors.white,
                  ))
              : Center(
                  child: Container(
                    height: 30,
                    width: 30,
                    child: CircularProgressIndicator(color: Colors.white),
                  ),
                ),
          SizedBox(width: 15),
        ],
        //   centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            margin: EdgeInsets.all(10),
            height: 60,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: count,
              itemBuilder: (context, item) => InkWell(
                onTap: () {
                  setState(() {
                    x1 = [];
                    y1 = [];
                    x2 = [];
                    y2 = [];
                    selectedUser = emails[item];
                    first = true;
                  });
                },
                child: Container(
                  margin: const EdgeInsets.only(right: 10),
                  child: CircleAvatar(
                      radius: 25,
                      backgroundColor: Color(int.parse(
                              colorsemail[item]
                                  .toUpperCase()
                                  .replaceAll("#", ""),
                              radix: 16) +
                          0xFF000000),
                      child: Center(
                          child: Text(
                        "${emails[item].toString().substring(0, 2)}",
                      ))),
                ),
              ),
            ),
          ),
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
                        Container(
                            child: PDFView(
                          filePath: _contractModel.filePath,
                          fitPolicy: FitPolicy.BOTH,
                          swipeHorizontal: true,
                          onRender: (pages) => setState(() {
                            this.pages = pages;
                            isstart = true;
                          }),
                          onPageChanged: (indexpages, _) => setState(() {
                            this.indexpages = indexpages;
                            _getpdfsize(px1, px2, py1, py2, pdfow, pdfoh);
                          }),
                          onViewCreated: (pdfViewController) => setState(
                            () {
                              this.pdfViewController = pdfViewController;
                            },
                          ),
                          onZoomChanged: (double zoom) {
                            setState(() {
                              if (zoom > scale) {
                                iszoom = true;
                              } else {
                                iszoom = false;
                              }
                            });
                          },
                          onError: (error) {
                            setState(() {
                              errorMessage = error.toString();
                              isdownloading = true;
                              downloadSpecificDoc(_contractModel.signDocUrl)
                                  .then((value) {
                                setState(() {
                                  _contractModel.filePath = value.path;
                                  isdownloading = false;
                                });
                                // Navigator.pushReplacement(
                                //     context,
                                //     MaterialPageRoute(
                                //         builder: (context) => ContractView(
                                //               contractModel: _contractModel,
                                //             )));
                              });
                            });

                            print(error.toString());
                          },
                        )),
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
                                          // child: Center(
                                          //     child: Text(
                                          //         allusers[i]
                                          //             .toString()
                                          //             .substring(0, 2),
                                          //         style: TextStyle(
                                          //           fontSize: 6,
                                          //           color: Color(int.parse(
                                          //                   colorbox[i]
                                          //                       .toUpperCase()
                                          //                       .replaceAll(
                                          //                           "#", ""),
                                          //                   radix: 16) +
                                          //               0xFF000000),
                                          //         ))),
                                        ))
                                    : SizedBox(),
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
                      ],
                    )),
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
                    builder: (context) => showBottomList(emails)),
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

  Widget showBottomList(List emails) {
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
      } else {
        return null;
      }
    } catch (e) {
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
