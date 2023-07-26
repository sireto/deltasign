import 'dart:io';
import 'package:delta_sign/models/document_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_fullpdfview_fork/flutter_fullpdfview_fork.dart';
import 'package:get_it/get_it.dart';
import 'package:path/path.dart';

import '../../themes.dart';

class DocumentView extends StatefulWidget {
  final DocumentModel documentModel;
  const DocumentView({Key key, this.documentModel}) : super(key: key);

  @override
  _DocumentViewState createState() => _DocumentViewState(documentModel);
}

class _DocumentViewState extends State<DocumentView> {
  DocumentModel _documentModel;
  _DocumentViewState(this._documentModel);
  UserModel userModel = GetIt.I.get();
  Dio dio = new Dio();
  Directory _appDir = GetIt.I.get();
  int downloadprogress;
  int pages = 0;
  int indexpages = 0;
  bool isdownloading = false;
  bool isReady = false;
  String errorMessage = "";
  bool iszoom = false;
  var scale = 1.0;
  PDFViewController pdfViewController;

  @override
  Widget build(BuildContext context) {
    final text = '${indexpages + 1} of $pages';
    return Scaffold(
        appBar: AppBar(
          title: Text(_documentModel.fileName),
          backwardsCompatibility: false,
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios_new_rounded),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          backgroundColor: kprimaryColor,
          centerTitle: true,
        ),
        body: Stack(
          children: [
            Container(
              margin: const EdgeInsets.all(5),
              child: PDFView(
                filePath: _documentModel.filePath,
                swipeHorizontal: true,
                onRender: (pages) => setState(() {
                  this.pages = pages;
                  isReady = true;
                }),
                onZoomChanged: (double zoom) {
                  setState(() {
                    if (zoom > scale) {
                      iszoom = true;
                    } else {
                      iszoom = false;
                    }
                  });
                },
                onPageChanged: (indexpages, _) => setState(() {
                  this.indexpages = indexpages;
                }),
                onViewCreated: (pdfViewController) => setState(
                  () {
                    this.pdfViewController = pdfViewController;
                  },
                ),
                onError: (error) {
                  setState(() {
                    errorMessage = error.toString();
                    isdownloading = true;
                    downloadSpecificDoc(_documentModel.pdfLink).then((value) {
                      setState(() {
                        _documentModel.filePath = value.path;
                        isdownloading = false;
                      });
                    });
                  });
                  print(error.toString());
                },
              ),
            ),
            errorMessage.isEmpty
                ? !isReady
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
        bottomNavigationBar: Container(
          margin: EdgeInsets.only(bottom: 10),
          height: 20,
          alignment: Alignment.center,
          child: pages != 0 ? Text(text) : Text("0 of 0"),
        ));
  }

  Future downloadSpecificDoc(String url) async {
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
    final bytes = response.data;
    return storeFile(url, bytes);
  }

  Future<File> storeFile(String url, List<int> bytes) async {
    final filename = basename(url);
    final file = File('${_appDir.path}/$filename');

    await file.writeAsBytes(bytes, flush: true);
    return file;
  }
}
