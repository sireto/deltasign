// import 'package:delta_sign/themes.dart';
// import 'package:flutter/material.dart';

// class Profile extends StatefulWidget {
//   const Profile({Key key}) : super(key: key);

//   @override
//   _ProfileState createState() => _ProfileState();
// }

// class _ProfileState extends State<Profile> {
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         elevation: 0,
//         title: Text(
//           "Profile",
//           style: TextStyle(color: Colors.black),
//         ),
//         centerTitle: true,
//         backgroundColor: Colors.white,
//         actions: [
//           IconButton(
//             icon: Icon(
//               Icons.close,
//               color: Colors.black,
//               size: 30,
//             ),
//             onPressed: () {
//               Navigator.pop(context);
//             },
//           ),
//           SizedBox(
//             width: 5,
//           ),
//         ],
//       ),
//       body: SafeArea(
//         child: SingleChildScrollView(
//           child: Column(
//             children: [
//               Container(
//                 padding: EdgeInsets.only(top: 20),
//                 child: CircleAvatar(
//                   backgroundColor: kprimaryColor,
//                   radius: 50,
//                   child: Icon(
//                     Icons.person,
//                     size: 50,
//                     color: Colors.white,
//                   ),
//                 ),
//               ),
//               SizedBox(height: 20),
//               Container(
//                 margin: const EdgeInsets.all(10),
//                 padding: const EdgeInsets.all(10),
//                 decoration: BoxDecoration(
//                     boxShadow: [
//                       BoxShadow(
//                         color: kprimaryColor.withOpacity(0.1),
//                         spreadRadius: 1,
//                         blurRadius: 1,
//                         offset: Offset(0, 1),
//                       )
//                     ],
//                     borderRadius: BorderRadius.circular(12),
//                     color: Colors.white),
//                 child: Row(
//                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                   children: [
//                     Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         Text(
//                           "Name",
//                           style: TextStyle(fontSize: 15),
//                         ),
//                         SizedBox(height: 5),
//                         Text(
//                           "Anonymous",
//                           style: TextStyle(fontSize: 18),
//                         ),
//                       ],
//                     ),
//                     Icon(
//                       Icons.edit,
//                       size: 30,
//                     ),
//                   ],
//                 ),
//               ),
//               Container(
//                 margin: const EdgeInsets.all(10),
//                 padding: const EdgeInsets.all(10),
//                 decoration: BoxDecoration(
//                     boxShadow: [
//                       BoxShadow(
//                         color: kprimaryColor.withOpacity(0.1),
//                         spreadRadius: 1,
//                         blurRadius: 1,
//                         offset: Offset(0, 1),
//                       )
//                     ],
//                     borderRadius: BorderRadius.circular(12),
//                     color: Colors.white),
//                 child: Row(
//                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                   children: [
//                     Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         Text(
//                           "Location",
//                           style: TextStyle(fontSize: 15),
//                         ),
//                         SizedBox(height: 5),
//                         Text(
//                           "Nepal",
//                           style: TextStyle(fontSize: 18),
//                         ),
//                       ],
//                     ),
//                     Icon(
//                       Icons.location_on,
//                       size: 30,
//                     ),
//                   ],
//                 ),
//               ),
//               Container(
//                 width: MediaQuery.of(context).size.width,
//                 margin: const EdgeInsets.all(10),
//                 padding: const EdgeInsets.all(10),
//                 decoration: BoxDecoration(
//                     boxShadow: [
//                       BoxShadow(
//                         color: kprimaryColor.withOpacity(0.1),
//                         spreadRadius: 1,
//                         blurRadius: 1,
//                         offset: Offset(0, 1),
//                       )
//                     ],
//                     borderRadius: BorderRadius.circular(12),
//                     color: Colors.white),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Text(
//                       "Email",
//                       style: TextStyle(fontSize: 15),
//                     ),
//                     SizedBox(height: 5),
//                     Text(
//                       "anonymous@gmail.com",
//                       style: TextStyle(fontSize: 18, color: Colors.grey),
//                     ),
//                   ],
//                 ),
//               ),
//               SizedBox(height: 10),
//               ElevatedButton(
//                 onPressed: () {},
//                 child: Text("Logout"),
//                 style: ElevatedButton.styleFrom(
//                     shape: RoundedRectangleBorder(
//                         borderRadius: BorderRadius.circular(12)),
//                     padding: const EdgeInsets.symmetric(
//                         horizontal: 25, vertical: 12)),
//               )
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
