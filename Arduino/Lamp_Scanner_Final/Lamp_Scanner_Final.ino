// This sketch code is based on the RPLIDAR driver library provided by RoboPeak
#include <RPLidar.h>
#include <SoftwareSerial.h>
#include <HardwareSerial.h>
#include <DynamixelSerial.h>
#include <math.h>
#include <stdio.h>
#include <SPI.h>
#include <SD.h>





// You need to create an driver instance 
RPLidar lidar;

// Change the pin mapping based on your needs.
/////////////////////////////////////////////////////////////////////////////

#define RPLIDAR_MOTOR 3 // The PWM pin for control the speed of RPLIDAR's motor.
// This pin should connected with the RPLIDAR's MOTOCTRL signal 
//////////////////////////////////////////////////////////////////////////////


SoftwareSerial SENSOR_FEED(9,8);


float distance;
float angle;
int counter;
byte quality;
int slotCounterRepeat;

const int res = 700;
long distances[res];
long angles[res];
int slotCounter = 0;
int slotCounterOld = 0;
int motorAngle;
int motorAngleEnd;
int motorAngleStart;
//long motorCounter = 0;
//long var;


int increment = 0;
File dataFile;


void setup() {

  //var = 0;
  motorAngleStart = 175;
  motorAngleEnd = 805;
  //motorAngleEnd = 350;

  slotCounterRepeat = 0;


  // bind the RPLIDAR driver to the arduino hardware serial
  lidar.begin(Serial2);

  //SdistancesENSOR_FEED.begin(115200);
  //Serial.begin(115200);

  // Open serial communications and wait for port to open:
  Serial.begin(9600);

  Dynamixel.begin(1000000,2);  // Inicialize the servo at 1Mbps and Pin Control 2

    // set pin modes
  pinMode(RPLIDAR_MOTOR, OUTPUT);
  memset(distances,0,res);
  memset(angles,0,res);
  slotCounter = 0; 

  motorAngle = motorAngleStart;

  // Reset  Motor
  int currentPos = Dynamixel.readPosition(1);
  // Serial.print(currentPos);

  //  int posDifference = currentPos -   map(motorAngleStart, 0, 180, 212, 812);
  int posDifference = currentPos - motorAngleStart;

  if(posDifference > 0){
    for(int i = 0; i<= abs(posDifference); i++){

      Dynamixel.move(1,currentPos - i);
      delay(50);

    }
  }

  if(posDifference < 0){
    for(int i = 0; i<= abs(posDifference); i++){

      Dynamixel.move(1,currentPos + i);
      delay(50);
    }
  }



  // SD Card
  // ---------------------------------------------------

  counter = 0;



  Serial.print("Initializing SD card...");
  // make sure that the default chip select pin is set to
  // output, even if you don't use it:
  pinMode(53, OUTPUT);

  // see if the card is present and can be initialized:
  while(!SD.begin(53)) {
    Serial.println("Card failed, or not present");
    // don't do anything more:
  //  return;
  }
  Serial.println("card initialized.");

  //SD.begin();
  if (SD.exists("logfile.txt")) {
    Serial.println("logfile.txt exists.");
    Serial.println(SD.remove("logfile.txt"));
    SD.remove("logfile.txt");
    delay(1000);

    dataFile = SD.open("logfile.txt", O_CREAT | O_TRUNC);
    delay(1000);
    dataFile.close();
    delay(1000);

  }

  // ---------------------------------------------------
}



void loop() {

  if(motorAngle > motorAngleEnd){

    Serial.println("THE END");
    analogWrite(RPLIDAR_MOTOR, 0);
    //  dataFile.close();
    return;
  }

  if (IS_OK(lidar.waitPoint())) {

    counter ++;
    distance = 0;
    angle = 0;
    quality = 0;

    //perform data processing here... 
    distance = lidar.getCurrentPoint().distance;
    angle = lidar.getCurrentPoint().angle;
    quality = lidar.getCurrentPoint().quality;


    float slot = floor(map(angle,0,360,0,res));
    int slot1 = (int)slot;

    if(distances[slot1] == 0){

      if(distance >= 10){
        distances[slot1] = distance;
        angles[slot1] = angle;
      }

    } 


    if(counter % 1000 == 0.0){

      for(int i = 0; i< res; i++){

        if(distances[i] >= 10){
          slotCounter ++; 
        }                                                         

      }


      if(slotCounterOld == slotCounter){
        slotCounterRepeat ++;
      } 
      else {
        slotCounterRepeat = 0;
      }


      slotCounterOld = slotCounter;



       Serial.println(slotCounter);

      if(slotCounter >= 500 || slotCounterRepeat > 1){

        slotCounterRepeat = 0;    

      //  Serial.println(motorAngle);
        Dynamixel.move(1,motorAngle);        

        dataFile = SD.open("logfile.txt", O_CREAT | O_APPEND | O_WRITE);

        Serial.println("");
        Serial.println("---------------- DONE!!!!!!! -----------------");
        Serial.println(motorAngle);
        Serial.println("");

        if(motorAngle == motorAngleStart){
         // dataFile.print("{ \"points\":{");
         dataFile.print("A");
        }

        for(int i = 0; i< res; i++){


         // dataFile.print("\"");
         // var = i + motorCounter * res;
//          dataFile.print(var);
//          dataFile.print("\": {\"");
//          dataFile.print("x\": \"");
//          dataFile.print(distances[i]);
//          dataFile.print("\", \"");
//          dataFile.print("y\": \"");
//          dataFile.print(angles[i]);
//          dataFile.print("\", \"");
//          dataFile.print("z\": \"");
//          dataFile.print(motorAngle);
//          dataFile.print("\"");

            dataFile.print("P");
            dataFile.print("x");
            dataFile.print(distances[i]);
            dataFile.print("x");
            dataFile.print("y");
            dataFile.print(angles[i]);
            dataFile.print("y");
            dataFile.print("z");
            dataFile.print(motorAngle);
            dataFile.print("z");
            dataFile.print("P");


          if(i < res-1){
        //    dataFile.print("}, "); 
          }

          distances[i] = 0.0;

        }

        if(motorAngle >= motorAngleEnd){
          dataFile.print("O");
          //dataFile.print("}}}");
        }
        else{
         // dataFile.print("}, ");
        }


      //  motorCounter++;
        motorAngle += 1; 



        dataFile.close();

      }




      slotCounter = 0;

    }


  } 
  else {
    analogWrite(RPLIDAR_MOTOR, 0); //stop the rplidar motor

    // try to detect RPLIDAR... 
    rplidar_response_device_info_t info;
    if (IS_OK(lidar.getDeviceInfo(info, 100))) {
      //detected...
      Serial.println("Start Scan");
      lidar.startScan();
      analogWrite(RPLIDAR_MOTOR, 100);
      delay(1000);
    }
  }
}


