import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/document_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:delta_sign/screens/Contract/employee_contract.dart';
import 'package:delta_sign/screens/Signer/sEmployee_contract.dart';
import 'package:delta_sign/screens/homescreen/contractView.dart';
import 'package:delta_sign/screens/homescreen/documentview.dart';
import 'package:delta_sign/themes.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get_it/get_it.dart';

bool isSelected = true;

class Search extends SearchDelegate {
  String filterBy = "documents";
  List<DocumentModel> _documents = GetIt.I.get();
  List<ContractModel> _contracts = GetIt.I.get();
  UserModel _userModel = GetIt.I.get();
  Search({List documents, List contracts}) {
    _documents = documents == null ? [] : documents;
    _contracts = contracts == null ? [] : contracts;
  }
  @override
  TextStyle get searchFieldStyle => TextStyle(
      fontSize: 16, color: Colors.black38, fontWeight: FontWeight.w300);
  int selectedIndex = 0;
  @override
  String get searchFieldLabel => "Search Here";

  // @override
  // ThemeData appBarTheme(BuildContext context) {
  //   assert(context != null);
  //   final ThemeData theme = Theme.of(context).copyWith(

  //     textTheme: TextTheme(
  //       headline6: TextStyle(
  //           color: Colors.black54, fontSize: 17.0, fontWeight: FontWeight.w300),
  //     ),
  //   );
  //   assert(theme != null);
  //   return theme;
  // }
  @override
  ThemeData appBarTheme(BuildContext context) {
    assert(context != null);
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    assert(theme != null);
    return theme.copyWith(
      appBarTheme: AppBarTheme(
        elevation: 0.0,
        brightness: colorScheme.brightness,
        backgroundColor: colorScheme.brightness == Brightness.dark
            ? Colors.grey[900]
            : Colors.white,
        iconTheme: theme.primaryIconTheme.copyWith(color: Colors.grey),
        textTheme: theme.textTheme,
      ),
      inputDecorationTheme: searchFieldDecorationTheme ??
          InputDecorationTheme(
            hintStyle: searchFieldStyle ?? theme.inputDecorationTheme.hintStyle,
            border: InputBorder.none,
          ),
    );
  }
  // @override
  // ThemeData appBarTheme(BuildContext context) {
  //   assert(context != null);
  //   final ThemeData theme = Theme.of(context);
  //   final ColorScheme colorScheme = theme.colorScheme;
  //   assert(theme != null);
  //   return theme.copyWith(
  //     appBarTheme: AppBarTheme(
  //       brightness: colorScheme.brightness,
  //       backgroundColor: colorScheme.brightness == Brightness.dark
  //           ? Colors.grey[900]
  //           : Colors.white,
  //       iconTheme: theme.primaryIconTheme.copyWith(color: Colors.grey),
  //       textTheme: TextTheme(
  //         headline6: TextStyle(
  //             color: Colors.black26,
  //             fontSize: 17.0,
  //             fontWeight: FontWeight.w300),
  //       ),
  //     ),
  //     inputDecorationTheme: searchFieldDecorationTheme ??
  //         InputDecorationTheme(
  //           hintStyle: searchFieldStyle ?? theme.inputDecorationTheme.hintStyle,
  //           border: InputBorder.none,
  //         ),
  //   );
  // }

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        onPressed: () {
          query = '';
        },
        icon: query.length != 0 ? Icon(Icons.clear) : Icon(null),
      )
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: Icon(Icons.arrow_back_ios_new_rounded),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    // throw UnimplementedError();
    // return null;
    return buildSuggestions(context);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    var result;
    if (query.isEmpty) {
      return StatefulBuilder(
          builder: (BuildContext context, StateSetter setState) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(18.0),
              child: Text(
                'Filter by :',
                style: TextStyle(fontSize: 14, color: Colors.black45),
              ),
            ),
            Container(
              child: Row(
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: InkWell(
                        onTap: () {
                          setState(() {
                            selectedIndex = 0;

                            filterBy = "documents";
                          });
                        },
                        child: Column(
                          children: <Widget>[
                            Icon(
                              FontAwesomeIcons.filePdf,
                              color: selectedIndex == 0
                                  ? kprimaryColor
                                  : Colors.black38,
                              size: 25,
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Text(
                                'Document',
                                style: TextStyle(
                                    fontSize: 13,
                                    color: selectedIndex == 0
                                        ? kprimaryColor
                                        : Colors.black38),
                              ),
                            )
                          ],
                        )),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: InkWell(
                        onTap: () {
                          setState(() {
                            selectedIndex = 1;
                            filterBy = "contracts";
                          });
                        },
                        child: Column(
                          children: <Widget>[
                            Icon(
                              FontAwesomeIcons.fileContract,
                              color: selectedIndex == 1
                                  ? kprimaryColor
                                  : Colors.black38,
                              size: 25,
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Text(
                                'Contracts',
                                style: TextStyle(
                                    fontSize: 13,
                                    color: selectedIndex == 1
                                        ? kprimaryColor
                                        : Colors.black38),
                              ),
                            )
                          ],
                        )),
                  ),
                ],
              ),
            )
          ],
        );
      });
    } else {
      if (selectedIndex == 0) {
        result = _documents
            .where((element) =>
                element.fileName.toLowerCase().contains(query.toLowerCase()))
            .toList();
      } else if (selectedIndex == 1) {
        result = _contracts
            .where((element) => element.contractName
                .toLowerCase()
                .contains(query.toLowerCase()))
            .toList();
      }
    }

    return ListView.builder(
        itemCount: result.length,
        itemBuilder: (context, index) => ListTile(
              onTap: () {
                if (selectedIndex == 0) {
                  if (FocusScope.of(context).isFirstFocus) {
                    FocusScope.of(context).requestFocus(new FocusNode());
                    Future.delayed(Duration(milliseconds: 500)).then((value) {
                      DocumentModel _documentsmodel =
                          _documents[_documents.indexOf(result[index])];
                      Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                              builder: (context) => DocumentView(
                                    documentModel: _documentsmodel,
                                  )));
                    });
                  } else {
                    DocumentModel _documentsmodel =
                        _documents[_documents.indexOf(result[index])];
                    Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                            builder: (context) => DocumentView(
                                  documentModel: _documentsmodel,
                                )));
                  }
                } else {
                  var isContractSign = false;
                  result[index].annotations.forEach((element) {
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
                  if (FocusScope.of(context).isFirstFocus) {
                    FocusScope.of(context).requestFocus(new FocusNode());

                    Future.delayed(Duration(milliseconds: 500)).then((value) {
                      ContractModel _contractsModel =
                          _contracts[_contracts.indexOf(result[index])];
                      (_contractsModel.send &&
                                  !_contractsModel.signers
                                      .contains(_userModel.email) ||
                              _contractsModel.isContractSigned ||
                              isContractSign == false)
                          ? Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => ContractView(
                                        contractModel: _contractsModel,
                                      )))
                          : Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => SEmployee(
                                        contractmodel: _contractsModel,
                                      )));
                    });
                  } else {
                    ContractModel _contractsModel =
                        _contracts[_contracts.indexOf(result[index])];
                    (_contractsModel.send &&
                                !_contractsModel.signers
                                    .contains(_userModel.email) ||
                            isContractSign == false ||
                            _contractsModel.isContractSigned)
                        ? Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                                builder: (context) => ContractView(
                                      contractModel: _contractsModel,
                                    )))
                        : Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                                builder: (context) => SEmployee(
                                      contractmodel: _contractsModel,
                                    )));
                  }
                }
              },
              leading: Icon(
                selectedIndex == 0
                    ? FontAwesomeIcons.filePdf
                    : result[index].send
                        ? FontAwesomeIcons.fileImport
                        : FontAwesomeIcons.fileExport,
                color: selectedIndex == 0
                    ? Colors.amber
                    : !result[index].send
                        ? Colors.blue
                        : Colors.green,
              ),
              title: Text(selectedIndex == 0
                  ? result[index].fileName
                  : result[index].contractName),
            ));
  }
}
