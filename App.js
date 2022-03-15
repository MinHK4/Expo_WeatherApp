import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Fontisto } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_KEY = 'bdb8ae574ddb12d63362a45c449fdf92';
const icons = {
  Clouds: 'cloudy',
  Clear: 'day-sunny',
  Atmosphere: 'cloudy-gusts',
  Snow: 'snow',
  Rain: 'rains',
  Drizzle: 'rain',
  Thunderstorm: 'lightning',
};

export default function App() {
  // useState 통한 상태값 관리
  const [ok, setOk] = useState(true);
  const [street, setStreet] = useState('Loading...');
  const [days, setDays] = useState([]);

  // useEffect에서 비동기화해서 사용할 함수 선언
  const ask = async () => {
    // 정보 열람 동의 구하고 아닌 경우 상태 체크해놓기
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) setOk(false);

    // 현재 위치 정보 받아오기
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    // 현재 위치를 기반으로 지리 정보 받아오기
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setStreet(location[0].street);
    // console.log(location);

    // 현재 위치를 기반으로 매일 날씨 정보 JSON으로 받아오기
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    // console.log(response);
    // console.log(json.daily);
    setDays(json.daily);
  };

  // 마운트 될 때 한 번만 작동하게 useEffect Hook 사용
  useEffect(() => {
    ask();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{street}</Text>
      </View>

      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}>
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: 'center' }}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View style={styles.iconbox}>
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={50}
                  color="white"
                />
              </View>
              <Text style={styles.main}>{day.weather[0].main}</Text>
              <Text style={styles.description}>
                {day.weather[0].description}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'tomato',
  },
  city: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 58,
    fontWeight: '500',
    color: 'white',
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  iconbox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  temp: {
    marginTop: 50,
    fontSize: 100,
    fontWeight: '700',
    color: 'white',
  },
  main: {
    marginTop: -10,
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
  },
  description: {
    marginTop: -5,
    fontSize: 20,
    color: 'white',
  },
});
