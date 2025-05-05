//Firebase functions: https://github.com/mobizt/Firebase-ESP32/blob/master/src/README.md

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>
// Thông tin WiFi
#define WIFI_SSID "Myhome A11"          //(1/4)
#define WIFI_PASSWORD "Myhomea11" //(2/4)

#define DHT_SENSOR_PIN 0
#define DHT_SENSOR_TYPE DHT22

// Thông tin Firebase
#define FIREBASE_HOST "https://baocaonongnghiep-default-rtdb.firebaseio.com/" //(3/4)
#define FIREBASE_AUTH "OX89luEq2f7sScetxAYkyvkzn7WBuL1fTbkL3FOY"    //(4/4)

DHT dht_sensor(DHT_SENSOR_PIN, DHT_SENSOR_TYPE);

// Chân GPIO của ESP32

float temp = 0, hum=0;

// Khởi tạo Firebase
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;
String path = "/";

void setup() {
  dht_sensor.begin();
  Serial.begin(115200);     // Khởi tạo Serial Monitor với baud rate 115200
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD); // Kết nối WiFi
  // Chờ kết nối WiFi
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected.");

  // Cấu hình Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;

  // Kết nối Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}
void loop() {
  // Gửi Nhiệt độ lên Firebase
  temp = dht_sensor.readTemperature();
  hum = dht_sensor.readHumidity(); 

  if (Firebase.setInt(firebaseData, "/weather/temperature", temp)) {
    Serial.print("Temp is sent to Firebase: ");
    Serial.println(temp);
  } else {
    Serial.print("Failed to send Temp: ");
    Serial.println(firebaseData.errorReason());
  }

    if (Firebase.setInt(firebaseData, "/weather/humidity", hum)) {
    Serial.print("Hum is sent to Firebase: ");
    Serial.println(hum);
  } else {
    Serial.print("Failed to send Hum: ");
    Serial.println(firebaseData.errorReason());
  }


  delay(1000); // delay 1s đọc 1 lần
}

