import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:delta_sign/screens/Signer/sEmployee_contract.dart';
import 'package:delta_sign/screens/homescreen/contractView.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get_it/get_it.dart';
import '../../../themes.dart';

class FilterScreen extends StatefulWidget {
  final List<ContractModel> contracts;
  FilterScreen({this.contracts});
  @override
  _FilterScreenState createState() => _FilterScreenState(contracts);
}

class _FilterScreenState extends State<FilterScreen> {
  int selectedTab = 0;
  UserModel _userModel = GetIt.I.get();
  List<ContractModel> contracts;
  List<ContractModel> _sendContracts = [];
  List<ContractModel> _receiveContracts = [];
  // List<int> signReceiveNumber;
  // List<int> signSendNumber;
  // List sendSigner;
  // List receiveSigner;
  _FilterScreenState(this.contracts);
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    if (contracts.isNotEmpty) {
      _sendContracts = contracts.where((element) => element.send).toList();
      _receiveContracts = contracts.where((element) => !element.send).toList();
    }
    // signReceiveNumber = List.filled(_receiveContracts.length, 0);
    // signSendNumber = List.filled(_sendContracts.length, 0);
    // sendSigner = List.filled(_sendContracts.length, []);
    // receiveSigner = List.filled(_receiveContracts.length, []);
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0.0,
          backgroundColor: kprimaryColor,
          leadingWidth: 30,
          title: Text(
            "Filter Contracts",
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 16),
          ),
          centerTitle: true,
          // actions: [
          //   IconButton(
          //     icon: Icon(Icons.search_rounded),
          //     onPressed: () {},
          //   ),
          // ],
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
                  'Sent (${_sendContracts.length})',
                  style: TextStyle(fontSize: 16),
                ),
              ),
              Tab(
                child: Container(
                  child: Text(
                    'Received (${_receiveContracts.length})',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
        body: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6.0),
            child: selectedTab == 0
                ? ListView.builder(
                    itemCount: _sendContracts.length,
                    itemBuilder: (context, index) => _buildSendCard(index))
                : ListView.builder(
                    itemCount: _receiveContracts.length,
                    itemBuilder: (context, index) => _buildReceiveCard(index))),
      ),
    );
  }

  //Contract send Card
  //Contract Card
  Card _buildSendCard(int index) {
    // var signerSendCopy = [];
    // var signCalculate = 0;
    // for (var i = 0; i < _sendContracts[index].annotations.length; i++) {
    //   // _contracts[index].annotations.forEach((element) {
    //   if (_sendContracts[index].annotations[i]["s3_url"] != null &&
    //       !signerSendCopy
    //           .contains(_sendContracts[index].annotations[i]['signer'])) {
    //     signerSendCopy.add(_sendContracts[index].annotations[i]['signer']);
    //     signCalculate = signCalculate + 1;
    //   }
    //   // });
    // }
    // signSendNumber[index] = signCalculate;
    // sendSigner[index] = signerSendCopy;
    return Card(
      child: InkWell(
        onTap: () {
          var isContractSign = false;
          _sendContracts[index].annotations.forEach((element) {
            if (element["signer"] == _userModel.email &&
                element['s3_url'] != null) {
              isContractSign = false;
            } else if (element['signer'] == _userModel.email &&
                element['s3_url'] == null) {
              isContractSign = true;
            }
          });
          if (isContractSign) {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => SEmployee(
                          contractmodel: _sendContracts[index],
                        )));
          } else {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => ContractView(
                          // signer: _sendContracts[index].signers.reversed.toList(),
                          // filename: _sendContracts[index].document["filename"]
                          contractModel: _sendContracts[index],
                        )));
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
          width: double.infinity,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              FaIcon(
                FontAwesomeIcons.fileExport,
                color: Colors.green,
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
                    Text(
                      _sendContracts[index].contractName ?? "",
                      style: TextStyle(
                        fontSize: 17,
                        color: Colors.grey.shade800,
                        //fontWeight: FontWeight.w400,
                      ),
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
                                    int.parse(_sendContracts[index]
                                        .createdDate
                                        .substring(0, 4)),
                                    int.parse(_sendContracts[index]
                                        .createdDate
                                        .substring(5, 7)),
                                    int.parse(_sendContracts[index]
                                        .createdDate
                                        .substring(8, 10)),
                                    int.parse(_sendContracts[index]
                                        .createdDate
                                        .substring(11, 13)),
                                    int.parse(_sendContracts[index]
                                        .createdDate
                                        .substring(14, 16)),
                                    int.parse(_sendContracts[index]
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
                            'No.of signers:${_sendContracts[index].signedNumber}/${_sendContracts[index].signers.length}',
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
      ),
    );
  }

  //Contract receive Card
  Card _buildReceiveCard(int index) {
    // var receiveSignerCopy = [];
    // var signCalculate = 0;
    // for (var i = 0; i < _receiveContracts[index].annotations.length; i++) {
    //   // _contracts[index].annotations.forEach((element) {
    //   if (_receiveContracts[index].annotations[i]["s3_url"] != null &&
    //       !receiveSignerCopy
    //           .contains(_receiveContracts[index].annotations[i]['signer'])) {
    //     receiveSignerCopy
    //         .add(_receiveContracts[index].annotations[i]['signer']);
    //     signCalculate = signCalculate + 1;
    //   }
    //   // });
    // }
    // signReceiveNumber[index] = signCalculate;
    // receiveSigner[index] = receiveSignerCopy;
    return Card(
      child: InkWell(
        onTap: () {
          var isContractSign = false;
          _sendContracts[index].annotations.forEach((element) {
            if (element["signer"] == _userModel.email &&
                element['s3_url'] != null) {
              isContractSign = false;
            } else if (element['signer'] == _userModel.email &&
                element['s3_url'] == null) {
              isContractSign = true;
            }
          });
          if (isContractSign) {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => SEmployee(
                          contractmodel: _receiveContracts[index],
                        )));
          } else {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => ContractView(
                          // signer: _sendContracts[index].signers.reversed.toList(),
                          // filename: _sendContracts[index].document["filename"]
                          contractModel: _receiveContracts[index],
                        )));
          }
          // Navigator.push(
          //     context,
          //     MaterialPageRoute(
          //         builder: (context) => SEmployee(
          //               contractmodel: _receiveContracts[index],
          //             )));
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
          width: double.infinity,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              FaIcon(
                FontAwesomeIcons.fileImport,
                color: Colors.blue,
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
                    Text(
                      _receiveContracts[index].contractName ?? "",
                      style: TextStyle(
                        fontSize: 17,
                        color: Colors.grey.shade800,
                        //fontWeight: FontWeight.w400,
                      ),
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
                                    int.parse(_receiveContracts[index]
                                        .createdDate
                                        .substring(0, 4)),
                                    int.parse(_receiveContracts[index]
                                        .createdDate
                                        .substring(5, 7)),
                                    int.parse(_receiveContracts[index]
                                        .createdDate
                                        .substring(8, 10)),
                                    int.parse(_receiveContracts[index]
                                        .createdDate
                                        .substring(11, 13)),
                                    int.parse(_receiveContracts[index]
                                        .createdDate
                                        .substring(14, 16)),
                                    int.parse(_receiveContracts[index]
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
                            'No.of signers:${_receiveContracts[index].signedNumber}/${_receiveContracts[index].signers.length}',
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
      ),
    );
  }
}
