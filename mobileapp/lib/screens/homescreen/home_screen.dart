import 'dart:io';
import 'package:delta_sign/config/size_config.dart';
import 'package:delta_sign/database/contract_operation.dart';
import 'package:delta_sign/database/document_operation.dart';
import 'package:delta_sign/database/server_operation.dart';
import 'package:delta_sign/main.dart';
import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/document_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:delta_sign/provider/ApiUrlProvider.dart';
import 'package:delta_sign/screens/Contract/employee_contract.dart';
import 'package:delta_sign/screens/Signer/sEmployee_contract.dart';
import 'package:delta_sign/screens/homescreen/components/filter_screen.dart';
import 'package:delta_sign/screens/homescreen/contractView.dart';
import 'package:delta_sign/screens/homescreen/documentview.dart';
import 'package:delta_sign/screens/otp/otp_screen.dart';
import 'package:delta_sign/screens/profile/edit_profile_screen.dart';
import 'package:delta_sign/screens/search/search_screen.dart';
import 'package:delta_sign/screens/sign_in/sign_in_screen.dart';
import 'package:delta_sign/themes.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get_it/get_it.dart';
import 'package:provider/provider.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'package:path/path.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  UserModel _userModel = GetIt.I.get();
  Directory _appDir = GetIt.I.get();
  ApiUrlProvider apiUrlProvider;
  List<ContractModel> _contracts = GetIt.I.get();
  DocumentOperation _dbDocumentOp = DocumentOperation();
  ContractOperation _dbContractOp = ContractOperation();
  bool isLoading = false;
  ServerOp _serverOp;
  // List<int> sign;
  // List signers;
  int selectedTab = 0;
  bool isRenaming = false;
  List<DocumentModel> _documents = GetIt.I.get();
  var key = GlobalKey<FormState>();
  TextEditingController rename = TextEditingController();
  TextEditingController contractName = TextEditingController();
  TextEditingController apiUrl = TextEditingController();
  List _documentUuids = [];
  List _contractUuids = [];
  RefreshController _refreshController =
      RefreshController(initialRefresh: false);
  @override
  void initState() {
    super.initState();
    if (_contracts.isEmpty) {
      selectedTab = 1;
    }
    //ContractModel.fromMap(map: map);
    _serverOp = ServerOp(
        apiKey: _userModel.apiKey,
        uuid: _userModel.uuid,
        context: this.context);
    // syncing the un uploaded document to server
    // Sync().syncToServer().then((value) {
    //   if (value) {
    //     setState(() {});
    //   }
    // });
    print(_userModel.apiKey);

    _refresh(purpose: 'sync');
    // sign = List.filled(_contracts.length, 0);
    // signers = List.filled(_contracts.length, []);
  }

  Future _fetchDoc() async {
    List value = await _serverOp.getAllDoc(purpose: 'sync');
    List values = [];
    if (value.isNotEmpty) {
      for (int i = 0; i < value.length; i++) {
        if (!_documentUuids.contains(value[i]['uuid'])) {
          String url = value[i]['s3_url'];
          value[i]['filePath'] = '${_appDir.path}/${basename(url)}';
          values.add(value[i]);
          _serverOp.downloadDocument(url);
        }
      }
      if (values.isNotEmpty) {
        await _dbDocumentOp.addAll(values);
        List<DocumentModel> documents = await _dbDocumentOp.getAll();
        documents = documents.reversed.toList();
        GetIt.I.unregister<List<DocumentModel>>();
        GetIt.I.registerSingleton<List<DocumentModel>>(documents);
        return documents;
      }
    }
  }

  // fetch contract data from server
  Future _fetchContract() async {
    List sentContracts =
        await _serverOp.getContract(sent: true, purpose: 'sync');
    List receivedContracts =
        await _serverOp.getContract(received: true, purpose: 'sync');
    List totalContracts = sentContracts + receivedContracts;
    List values = [];
    if (totalContracts.isNotEmpty) {
      for (int i = 0; i < totalContracts.length; i++) {
        if (!_contractUuids.contains(totalContracts[i]['uuid'])) {
          String url = totalContracts[i]['signed_doc_url'];
          totalContracts[i]['filePath'] = '${_appDir.path}/${basename(url)}';
          totalContracts[i]['isSigned'] = false;
          values.add(totalContracts[i]);
          _serverOp.downloadDocument(url);
        } else if (totalContracts[i]['signed_number'] !=
            _contracts[_contractUuids.indexOf(totalContracts[i]['uuid'])]
                .signedNumber) {
          String url = totalContracts[i]['signed_doc_url'];
          print(url);
          totalContracts[i]['filePath'] = '${_appDir.path}/${basename(url)}';
          int index = _contractUuids.indexOf(totalContracts[i]['uuid']);
          totalContracts[i]['isSigned'] = _contracts[index].isContractSigned;
          _contracts[index] = ContractModel.fromMap(
              id: _contracts[index].id, map: totalContracts[i]);

          await _dbContractOp.update(_contracts[index]);
          _serverOp.downloadDocument(url);
        }
      }
      if (values.isNotEmpty) {
        //   values.forEach((element) {
        //     print(element['uuid']);
        //   });
        // for (int i = 0; i < values.length; i++) {
        //   if (values[i]['send']) {
        //     List removeValues = [];
        //     for (int i = 0; i < values.length - 1; i++) {
        //       for (int j = i + 1; j < values.length; j++) {
        //         if (values[i]['uuid'] == values[j]['uuid']) {
        //           removeValues.add(values[j]);
        //         }
        //       }
        //     }
        //     print("values $removeValues");
        //     for (int i = 0; i < removeValues.length; i++) {
        //       print("removed ${removeValues[i]}");
        //       values.remove(removeValues[i]);
        //     }
        //   }
        // }

        // Set uniqueValues = values.toSet();
        await _dbContractOp.addAll(values);
        List<ContractModel> contracts = await _dbContractOp.getAll();
        contracts = contracts.reversed.toList();
        GetIt.I.unregister<List<ContractModel>>();
        GetIt.I.registerSingleton<List<ContractModel>>(contracts);
        return contracts;
      }
    }
  }

  void _refresh({String purpose = 'refresh'}) async {
    // Sync().syncToServer().then((value) {
    //   if (value) {
    //     setState(() {});
    //   }
    // });

    _documentUuids = _documents.map((e) => e.uuid).toList();
    _contractUuids = _contracts.map((e) => e.uuid).toList();
    // _contractSignedDocUrl = _contracts.map((e) => e.signDocUrl).toList();
    // List fileNames = _contracts.map((e) => e.document['filename']).toList();
    // List fileHashes = _contracts.map((e) => e.document['file_hash']).toList();
    Future saved = _fetchDoc();
    saved.then((value) {
      if (value != null) {
        setState(() {
          _documents = value;
          // changed = true;
        });
      }
    });
    print("fetching contract");
    saved = _fetchContract();
    saved.then((value) {
      if (value != null) {
        setState(() {
          _contracts = value;
          //changed = true;
        });
      }
    });
    if (purpose == 'refresh') {
      _refreshController.refreshCompleted();
      setState(() {});
    }
  }

  @override
  void dispose() {
    // TODO: implement dispose
    rename.dispose();
    contractName.dispose();
    apiUrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // }
    return DefaultTabController(
      length: 2,
      initialIndex: selectedTab,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0.0,
          backgroundColor: kprimaryColor,
          leadingWidth: 30,
          title: Text("Delta Sign",
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w400,
                  fontSize: 18)),
          leading: InkWell(
            child: Container(
              padding: const EdgeInsets.only(left: 5),
              child: _userModel.imagePath != null
                  ? Padding(
                      padding: const EdgeInsets.only(top: 15, bottom: 15),
                      child: ClipOval(
                        // radius: 60,

                        // backgroundImage:FileImage(File(_userModel.imagePath),
                        //      )
                        child: Image.file(
                          File(_userModel.imagePath),
                          fit: BoxFit.cover,
                        ),
                        //child:
                      ),
                    )
                  : Icon(Icons.account_circle_rounded, size: 30),
            ),
            onTap: () {
              Future profile = Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => EditProfileScreen(
                            userModel: _userModel,
                          )));
              profile.then((value) => {
                    setState(() {
                      _userModel = value;
                    })
                  });
            },
          ),
          actions: [
            IconButton(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              constraints: BoxConstraints(),
              icon: Icon(Icons.search_rounded),
              onPressed: () {
                showSearch(
                    context: context,
                    delegate:
                        Search(documents: _documents, contracts: _contracts));
              },
            ),
            PopupMenuButton(
                onSelected: (value) async {
                  if (value == 3) {
                    try {
                      await _dbContractOp.deleteAll();
                      await _dbDocumentOp.deleteAll();
                      await _userModel.delete();
                      GetIt.I.unregister<DocumentModel>();
                      GetIt.I.unregister<ContractModel>();
                      // _deleteCacheDir();
                      Fluttertoast.showToast(
                          msg: "Successfully logged out",
                          toastLength: Toast.LENGTH_SHORT,
                          gravity: ToastGravity.BOTTOM);
                      Navigator.pushAndRemoveUntil(
                          this.context,
                          MaterialPageRoute(
                              builder: (context) => SignInScreen()),
                          (route) => false);
                    } catch (e) {
                      Fluttertoast.showToast(
                          msg: "Failed to log out",
                          toastLength: Toast.LENGTH_SHORT,
                          gravity: ToastGravity.BOTTOM);
                    }
                  }
                  if (value == 2) {
                    apiUrlProvider =
                        Provider.of<ApiUrlProvider>(context, listen: false);
                    // if (apiUrl.text == null) {
                    setState(() {
                      apiUrl.text = apiUrlProvider.apiuri;
                    });
                    showDialog(
                        context: context,
                        barrierDismissible: false,
                        builder: (context) => StatefulBuilder(
                            builder:
                                (BuildContext context, StateSetter setState) =>
                                    showdialog(0, context, setState, apiUrl)));

                    // if (apiUrlProvider.apiuri != "http://10.0.2.2:8000/") {
                    //   apiUrlProvider.setApiUri("http://10.0.2.2:8000/");
                    // } else {
                    //   apiUrlProvider.setApiUri(
                    //       "https://dev-delta-api.cnftregistry.io/");
                    // }
                  }
                },
                padding: EdgeInsets.all(4.0),
                itemBuilder: (BuildContext context) => [
                      PopupMenuItem(
                        child: Text(
                          "Help & Feedback",
                          style: TextStyle(fontSize: 15),
                        ),
                      ),
                      PopupMenuItem(
                        child: Text(
                          "Share",
                          style: TextStyle(fontSize: 15),
                        ),
                      ),
                      PopupMenuItem(
                        value: 2,
                        child: Text(
                          "Change ApiUrl",
                          style: TextStyle(fontSize: 15),
                        ),
                      ),
                      PopupMenuItem(
                        value: 3,
                        child: Text(
                          "Log out",
                          style: TextStyle(fontSize: 15),
                        ),
                      ),
                    ])
          ],
          bottom: TabBar(
            indicatorColor: Colors.white,
            onTap: (index) {
              setState(() {
                selectedTab = index;
              });
            },
            tabs: <Widget>[
              Tab(
                child: Text(
                  'Contracts (${_contracts.length})',
                  style: TextStyle(fontSize: 16),
                ),
              ),
              Tab(
                child: Container(
                  child: Text(
                    'Documents (${_documents.length})',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
        floatingActionButton: Container(
          height: 55 / 3.6 * SizeConfig.imageSizeMultiplier,
          width: 55 / 3.6 * SizeConfig.imageSizeMultiplier,
          child: FloatingActionButton(
            backgroundColor: kprimaryColor,
            onPressed: () async {
              if (selectedTab == 0) {
                if (_contracts.isNotEmpty) {
                  Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) =>
                              FilterScreen(contracts: _contracts)));
                } else {
                  Fluttertoast.showToast(
                      msg: "No contracts to filter",
                      toastLength: Toast.LENGTH_SHORT,
                      gravity: ToastGravity.BOTTOM);
                }
              } else {
                FilePickerResult result = await FilePicker.platform.pickFiles(
                    type: FileType.custom, allowedExtensions: ['pdf']);
                if (result != null) {
                  setState(() {
                    _upload(result);
                    isLoading = true;
                  });

                  //bool isContain = await _dbDocumentOp.contain(documentModel);
                  //_serverOp.uploadDoc(documentModel);
                  // if (true) {
                  //   // int id = await _dbDocumentOp.add(documentModel);
                  //   // setState(() {
                  //   //   _documents = GetIt.I.get();
                  //   // });
                  //   // _upload(id, file.path);
                  //   Fluttertoast.showToast(
                  //       msg: "Successfully added",
                  //       toastLength: Toast.LENGTH_SHORT,
                  //       gravity: ToastGravity.BOTTOM);
                  // }
                  // else {
                  //   Fluttertoast.showToast(
                  //       msg: "Document already exists",
                  //       toastLength: Toast.LENGTH_SHORT,
                  //       gravity: ToastGravity.BOTTOM);
                  // }
                } else {
                  // User canceled the picker
                  print("User canceled the picker");
                }
              }
            },
            child: Icon(
              selectedTab == 0 ? Icons.filter_list : Icons.add,
              color: Colors.white,
              size: 22 / 3.6 * SizeConfig.imageSizeMultiplier,
            ),
          ),
        ),
        backgroundColor: Colors.white,
        floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
        body: Stack(
          children: [
            SmartRefresher(
              controller: _refreshController,
              onRefresh: _refresh,
              child: selectedTab == 0
                  ? _contracts.isEmpty
                      ? Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              height: SizeConfig.screenHeight * 0.05,
                            ),
                            Image(
                              height: SizeConfig.screenHeight * 0.35,
                              width: SizeConfig.screenWidth * 0.9,
                              image: AssetImage("assets/empty/nc.jpg"),
                              fit: BoxFit.fitWidth,
                            ),
                            SizedBox(height: SizeConfig.screenHeight * 0.05),
                            Text(
                              "No Contracts",
                              style: TextStyle(fontSize: 25),
                            ),
                            SizedBox(height: SizeConfig.screenHeight * 0.05),
                            Text(
                                "Please add Documents to create your Contracts"),
                            SizedBox(height: SizeConfig.screenHeight * 0.05),
                          ],
                        )
                      : ListView.builder(
                          itemCount: _contracts.length + 1,
                          itemBuilder: (context, index) {
                            if (index == _contracts.length) {
                              return Container(
                                height: 80 / 6.04 * SizeConfig.heightMultiplier,
                                width: double.infinity,
                              );
                            } else {
                              return _buildContractCard(index);
                            }
                          })
                  : _documents.length == 0
                      ? Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              height: SizeConfig.screenHeight * 0.05,
                            ),
                            Image(
                              height: SizeConfig.screenHeight * 0.35,
                              width: SizeConfig.screenWidth * 0.6,
                              image: AssetImage("assets/empty/edoc.jpg"),
                              fit: BoxFit.fitWidth,
                            ),
                            SizedBox(height: SizeConfig.screenHeight * 0.05),
                            Text(
                              "No Documents",
                              style: TextStyle(fontSize: 25),
                            ),
                            SizedBox(height: SizeConfig.screenHeight * 0.05),
                            Text("Please add your documents"),
                            SizedBox(height: SizeConfig.screenHeight * 0.05),
                          ],
                        )
                      : ListView.builder(
                          itemCount: _documents.length + 1,
                          itemBuilder: (context, index) {
                            if (index == _documents.length) {
                              return Container(
                                height: 80 / 6.04 * SizeConfig.heightMultiplier,
                                width: double.infinity,
                              );
                            } else {
                              return _buildDocumentCard(index, context);
                            }
                          }),
            ),
            isLoading
                ? Container(
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    kprimaryColor)),
                          ],
                        ),
                      ),
                    ),
                  )
                : SizedBox(),
          ],
        ),
      ),
    );
  }

  Future _upload(result) async {
    File file = File(result.files.single.path);
    String fileName = file.path.split('/').last;
    DateTime now = DateTime.now();
    String formattedDate = DateFormat('yyyy-MM-dd – kk:mm').format(now);
    DocumentModel documentModel = DocumentModel(
        fileName: fileName, filePath: file.path, createdDate: formattedDate);
    var value = await ServerOp(apiKey: _userModel.apiKey, context: this.context)
        .uploadDoc(filePath: file.path);
    if (value != null) {
      setState(() {
        _documents.insert(0, value);
        isLoading = false;
        Fluttertoast.showToast(
            msg: "Successfully added",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM);
      });
    } else {
      setState(() {
        isLoading = false;
        Fluttertoast.showToast(
            msg: "Failed",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM);
      });
    }
  }

  Future _deleteDoc(int index) async {
    var result = await _serverOp.deleteDoc(_documents[index]);
    if (result) {
      setState(() {
        _documents.removeAt(index);
        isLoading = false;
        Fluttertoast.showToast(
            msg: "Successfully deleted",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM);
      });
    } else {
      setState(() {
        isLoading = false;
        Fluttertoast.showToast(
            msg: "Failed",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM);
      });
    }
  }

  Future _rename(int index, BuildContext context) async {
    var value = await _serverOp.renameDoc(
        uuid: _documents[index].uuid, name: rename.text);
    if (value != null) {
      _documents[index].fileName = rename.text;
      await _dbDocumentOp.update(_documents[index]);
      isRenaming = false;
      setState(() {
        Fluttertoast.showToast(
            msg: "Successfully updated",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM);
        rename.clear();
        Navigator.pop(context);
      });
    } else {
      setState(() {
        isRenaming = false;
        rename.clear();
        Fluttertoast.showToast(
            msg: "Failed",
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM);
      });
    }
  }

  String processTypeCheck(TextEditingController processType) {
    if (processType == rename) {
      return "Rename";
    } else if (processType == contractName) {
      return "Contract Name";
    } else {
      return "Api Url";
    }
  }

  Widget showdialog(int index, BuildContext context, StateSetter setstate,
      TextEditingController processType) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(4.0))),
      child: Container(
        child: Form(
          key: key,
          child: Container(
            child: Stack(
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      height: 10,
                    ),
                    Container(
                      width: double.infinity,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                              padding: EdgeInsets.only(left: 15.0),
                              child: Text(
                                processTypeCheck(processType),
                                style: TextStyle(fontSize: 17),
                              )),
                          InkWell(
                              onTap: () {
                                if (processType == contractName) {
                                  setstate(() {
                                    contractName.clear();
                                  });
                                } else if (processType == rename) {
                                  setstate(() {
                                    rename.clear();
                                  });
                                } else {
                                  setstate(() {
                                    apiUrl.clear();
                                  });
                                }
                                Navigator.pop(context);
                              },
                              child: Container(
                                  alignment: Alignment.centerRight,
                                  margin: EdgeInsets.only(right: 10),
                                  child: Icon(
                                    Icons.clear,
                                    color: Colors.red.shade600,
                                  )))
                          // Text("Done",
                          //     style: TextStyle(
                          //         fontSize: 14, color: kprimaryColor))
                        ],
                      ),
                    ),
                    // SizedBox(height: 10),
                    Container(
                        color: Colors.white,
                        padding: EdgeInsets.only(left: 10),
                        margin: const EdgeInsets.only(left: 15, right: 15),
                        //decoration: ,
                        child: TextFormField(
                          //  initialValue:
                          //       processType == apiUrl ? apiUrl.text : "",
                          controller: processType,
                          autofocus: true,
                          decoration: InputDecoration(
                              border: UnderlineInputBorder(
                                  borderSide: BorderSide(width: 1)),
                              focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(width: 1)),
                              // enabledBorder: InputBorder.none,
                              // errorBorder: InputBorder.none,
                              // disabledBorder: InputBorder.none,

                              suffix: Container(
                                child: IconButton(
                                  padding: EdgeInsets.all(2.0),
                                  icon: Icon(
                                    FontAwesomeIcons.solidTimesCircle,
                                    color: Colors.black12,
                                    size: 22,
                                  ),
                                  onPressed: () {
                                    if (processType == contractName) {
                                      contractName.clear();
                                    } else if (processType == rename) {
                                      rename.clear();
                                    } else {
                                      apiUrl.clear();
                                    }
                                  },
                                ),
                              )),
                        )),
                    SizedBox(
                      height: 4.0,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                            onPressed: () async {
                              if (processType == rename) {
                                if (_documents[index].uuid != null) {
                                  if (rename.text.isNotEmpty) {
                                    setstate(() {
                                      isRenaming = true;
                                      _rename(index, context);
                                    });
                                  }
                                }
                              } else if (processType == contractName) {
                                if (contractName.text.isNotEmpty) {
                              
                                  Navigator.pop(context);
                                  Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (context) => CreateContract(
                                                documentModel:
                                                    _documents[index],
                                                contractName: contractName.text,
                                              ))).then(
                                      (value) => contractName.clear());
                                  // createContractReturn.then((value) => {
                                  //       setState(() {
                                  //         selectedTab = 0;
                                  //         _refresh();
                                  //       })
                                  //     });
                                }
                              } else {
                                if (apiUrl.text.isNotEmpty) {
                                  try {
                                    await _dbContractOp.deleteAll();
                                    await _dbDocumentOp.deleteAll();
                                    await _userModel.delete();
                                    GetIt.I.unregister<DocumentModel>();
                                    GetIt.I.unregister<ContractModel>();

                                    // _deleteCacheDir();
                                    // Fluttertoast.showToast(
                                    //     msg: "Successfully logged out",
                                    //     toastLength: Toast.LENGTH_SHORT,
                                    //     gravity: ToastGravity.BOTTOM);
                                    Navigator.pushAndRemoveUntil(
                                        this.context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                SignInScreen()),
                                        (route) => false);
                                    apiUrlProvider.setApiUri(apiUrl.text);
                                  } catch (e) {
                                    print(e);
                                  }
                                } else {
                                  Fluttertoast.showToast(
                                      msg: "ApiUrl must not be empty",
                                      gravity: ToastGravity.BOTTOM,
                                      toastLength: Toast.LENGTH_SHORT);
                                }
                              }
                            },
                            child: Text(
                              "ok",
                              style: TextStyle(
                                  color: kprimaryColor,
                                  fontSize: 17,
                                  fontWeight: FontWeight.w400),
                            ))
                      ],
                    )
                  ],
                ),
                isRenaming
                    ? Container(
                        height: 150 / 4.11 * SizeConfig.textMultiplier,
                        child: Center(
                          child: CircularProgressIndicator(
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(kprimaryColor)),
                        ),
                      )
                    : SizedBox()
              ],
            ),
          ),
        ),
      ),
    );
  }

  // contract card
  Card _buildContractCard(int index) {
    //_contracts File(_contracts[index].filePath.length)
    File file = File(_contracts[index].filePath);
    String size = "---";
    if (file.existsSync()) {
      size = (file.lengthSync() / 1048576).toStringAsFixed(2) + " mb";
      if (size == "0.00 mb") {
        size = (file.lengthSync() / 1024).toStringAsFixed(2) + " kb";
      }
    }
    return Card(
        child: InkWell(
      onTap: () {
        var isContractSign = false;
        _contracts[index].annotations.forEach((element) {
          if (element["signer"] == _userModel.email &&
              element['s3_url'] != null) {
            isContractSign = false;
            // setState(() {
            //   sign[index] = sign[index] + 1;
            // });
          } else if (element['signer'] == _userModel.email &&
              element['s3_url'] == null) {
            isContractSign = true;
          }
          //  else if (element['s3_url'] != null) {
          //   setState(() {
          //     sign[index] = sign[index] + 1;
          //   });
          // }
        });
      
        if (isContractSign == false || _contracts[index].isContractSigned) {
          Navigator.push(
              this.context,
              MaterialPageRoute(
                  builder: (context) => ContractView(
                        //  filepath: _contracts[index].filePath,
                        //   signer: _contracts[index].signers,
                        //   filename: _contracts[index].document["filename"]
                        contractModel: _contracts[index],
                      )));
        } else {
          Future sign = Navigator.push(
              this.context,
              MaterialPageRoute(
                  builder: (context) => SEmployee(
                        contractmodel: _contracts[index],
                      )));
          sign.then((value) => {
                if (value != null)
                  {
                    setState(() {
                      // _refresh();
                      _contracts = value;
                    })
                  }
              });
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
        width: double.infinity,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            FaIcon(
              !_contracts[index].send
                  ? FontAwesomeIcons.fileImport
                  : FontAwesomeIcons.fileExport,
              color: !_contracts[index].send ? Colors.blue : Colors.green,
              size: 27,
            ),
            SizedBox(
              width: 15,
            ),
            Flexible(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      //  Flexible(
                      //   child: RichText(
                      //     overflow: TextOverflow.ellipsis,
                      //     text: TextSpan(
                      //       text: _contracts[index].document['filename'],
                      //       style: TextStyle(
                      //         fontSize: 17,
                      //         color: Colors.grey.shade800,
                      //         //fontWeight: FontWeight.w400,
                      //       ),
                      //     ),
                      //   ),
                      // ),
                      Flexible(
                        child: Text(
                          _contracts[index].contractName ?? "",
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 17,
                            color: Colors.grey.shade800,
                            //fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                      Text(
                        "Size:$size",
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Container(
                    width: double.infinity,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      // mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          DateTime.utc(
                                  int.parse(_contracts[index]
                                      .createdDate
                                      .substring(0, 4)),
                                  int.parse(_contracts[index]
                                      .createdDate
                                      .substring(5, 7)),
                                  int.parse(_contracts[index]
                                      .createdDate
                                      .substring(8, 10)),
                                  int.parse(_contracts[index]
                                      .createdDate
                                      .substring(11, 13)),
                                  int.parse(_contracts[index]
                                      .createdDate
                                      .substring(14, 16)),
                                  int.parse(_contracts[index]
                                      .createdDate
                                      .substring(17, 19)))
                              .toLocal()
                              .toString()
                              .substring(0, 19),
                          // _contracts[index].createdDate.substring(0, 10),
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade500,
                          ),
                        ),
                        Text(
                          'No.of signers:${_contracts[index].signedNumber ?? 0}/${_contracts[index].signers.length}',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    ));
  }

  // document card
  Card _buildDocumentCard(int index, BuildContext context) {
    File file = File(_documents[index].filePath);
    String size = "---";
    if (file.existsSync()) {
      size = (file.lengthSync() / 1048576).toStringAsFixed(2) + " mb";
      if (size == "0.00 mb") {
        size = (file.lengthSync() / 1024).toStringAsFixed(2) + " kb";
      }
    }
    return Card(
      child: InkWell(
        onTap: () {
          if (_documents[index].filePath != null) {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => DocumentView(
                          documentModel: _documents[index],
                        )));
          } else {
            Fluttertoast.showToast(
                msg: "Failed\nPlease refresh and try again",
                gravity: ToastGravity.BOTTOM,
                toastLength: Toast.LENGTH_SHORT);
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
          width: double.infinity,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Flexible(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    FaIcon(
                      FontAwesomeIcons.filePdf,
                      color: Colors.amber,
                      size: 35,
                    ),
                    SizedBox(
                      width: 15,
                    ),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _documents[index].fileName,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 17,
                              color: Colors.grey.shade800,
                              //fontWeight: FontWeight.w400,
                            ),
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                DateTime.utc(
                                        int.parse(_documents[index]
                                            .createdDate
                                            .substring(0, 4)),
                                        int.parse(_documents[index]
                                            .createdDate
                                            .substring(5, 7)),
                                        int.parse(_documents[index]
                                            .createdDate
                                            .substring(8, 10)),
                                        int.parse(_documents[index]
                                            .createdDate
                                            .substring(11, 13)),
                                        int.parse(_documents[index]
                                            .createdDate
                                            .substring(14, 16)),
                                        int.parse(_documents[index]
                                            .createdDate
                                            .substring(17, 19)))
                                    .toLocal()
                                    .toString()
                                    .substring(0, 19),
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                              Text(
                                "Size:$size",
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              PopupMenuButton(
                  onSelected: (value) async {
                    if (value == 0) {
                      if (_documents[index].uuid != null) {
                        showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (context) => StatefulBuilder(
                                builder: (BuildContext context,
                                        StateSetter setState) =>
                                    showdialog(index, context, setState,
                                        contractName)));
                      } else {
                        Fluttertoast.showToast(
                            msg: "Failed\nPlease refresh and try again",
                            gravity: ToastGravity.BOTTOM,
                            toastLength: Toast.LENGTH_SHORT);
                      }
                    } else if (value == 1) {
                      setState(() {
                        rename.text = _documents[index].fileName;
                      });
                      showDialog(
                          context: context,
                          barrierDismissible: false,
                          builder: (context) => StatefulBuilder(
                              builder: (BuildContext context,
                                      StateSetter setState) =>
                                  showdialog(
                                      index, context, setState, rename)));
                    } else {
                      try {
                        setState(() {
                          _deleteDoc(index);
                          isLoading = true;
                        });
                      } catch (e) {
                        Fluttertoast.showToast(
                            msg: "Failed",
                            toastLength: Toast.LENGTH_SHORT,
                            gravity: ToastGravity.BOTTOM);
                      }
                    }
                  },
                  padding: EdgeInsets.all(4.0),
                  icon: Icon(
                    Icons.more_vert,
                    color: Colors.grey.shade700,
                  ),
                  iconSize: 20,
                  itemBuilder: (BuildContext context) => [
                        PopupMenuItem(
                          value: 0,
                          child: Text(
                            "Create Contract",
                            style: TextStyle(fontSize: 15),
                          ),
                        ),
                        PopupMenuItem(
                          value: 1,
                          child: Text(
                            "Rename Document",
                            style: TextStyle(fontSize: 15),
                          ),
                        ),
                        PopupMenuItem(
                          value: 2,
                          child: Text(
                            "Delete Document",
                            style: TextStyle(fontSize: 15),
                          ),
                        ),
                      ])
            ],
          ),
        ),
      ),
    );
  }

  _documentexist(String newfilename) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(height: 20),
          Text(
            "Document already exist",
            style: TextStyle(fontSize: 20),
          ),
          SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Column(
                children: [
                  Icon(
                    FontAwesomeIcons.filePdf,
                    size: 80,
                    color: kprimaryColor,
                  ),
                  SizedBox(height: 10),
                  newfilename.length > 10
                      ? Text(newfilename.substring(0, 10) + "...")
                      : Text(newfilename),
                ],
              ),
              Icon(
                FontAwesomeIcons.arrowAltCircleRight,
                color: kprimaryColor,
              ),
              Column(
                children: [
                  Icon(
                    FontAwesomeIcons.filePdf,
                    size: 80,
                    color: kprimaryColor,
                  ),
                  SizedBox(height: 10),
                  Text("old name")
                ],
              ),
            ],
          ),
          SizedBox(height: 20),
        ],
      ),
    );
  }
}
