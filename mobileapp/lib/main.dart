import 'package:delta_sign/provider/ApiUrlProvider.dart';
import 'package:delta_sign/screens/sign_in/sign_in_screen.dart';
import 'package:delta_sign/themes.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_downloader/flutter_downloader.dart';
import 'package:get_it/get_it.dart';
import 'package:provider/provider.dart';
import 'config/size_config.dart';
import 'models/user_model.dart';
import 'database/init.dart';
import 'screens/homescreen/home_screen.dart';

void main() async {
  // make sure that we have instance of Widget flutter binding which is used to interact with flutter engine
  WidgetsFlutterBinding.ensureInitialized();

  await Init.initialize();

  // Plugin must be initialized before using
  await FlutterDownloader.initialize(
      debug:
          true, // optional: set to false to disable printing logs to console (default: true)
      ignoreSsl:
          true // option: set to false to disable working with http links (default: false)
      );

  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => ApiUrlProvider()),
    ],
    child: MyApp(),
  ));
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
          primaryColor: kprimaryColor,
          textTheme: TextTheme(
              headline6: TextStyle(
                  fontSize: 16,
                  color: Colors.black,
                  fontWeight: FontWeight.w400))),
      home: LayoutBuilder(builder: (context, constraints) {
        return OrientationBuilder(builder: (context, orientation) {
          SizeConfig().init(constraints, orientation);
          return GetIt.I.isRegistered<UserModel>()
              ? HomeScreen()
              : SignInScreen();
        });
      }),
    );
  }
}
