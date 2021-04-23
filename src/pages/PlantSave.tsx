import React, { useCallback, useState } from 'react'
import { 
  Alert, 
  Image,
  Platform,
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Text 
} from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'
import { Button } from '../components/Button'
import { SvgFromUri } from 'react-native-svg'
import { useNavigation, useRoute } from '@react-navigation/core'
import DateTimePicker, { Event } from '@react-native-community/datetimepicker'

import waterdrop from '../assets/waterdrop.png'
import colors from '../styles/colors'
import fonts from '../styles/fonts'
import { PlantProps, savePlant } from '../libs/storage'
import { format, isBefore } from 'date-fns'

interface Params {
  plant: PlantProps;
}

export function PlantSave(){
  const [selectedDateTime, setSelectedDateTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios')
  const navigation = useNavigation()
  const route = useRoute()
  const { plant } = route.params as Params; 

  const handleChangeTime = useCallback((event: Event, dateTime: Date | undefined) => {
    if(Platform.OS === 'android'){
      setShowDatePicker(oldState => !oldState)
    }

    if(dateTime && isBefore(dateTime, new Date())){
      setSelectedDateTime(new Date())
      return Alert.alert('Escolha uma hora no futuro! ')
    }

    if(dateTime){
      setSelectedDateTime(dateTime)
    }
  }, [])

  const handleOpenDateTimePickerForAndroid = useCallback(() => {
    setShowDatePicker(oldState => !oldState)
  }, [])

  const handleSave = useCallback(async () => {
    
    try {
      await savePlant({
        ...plant,
        dateTimeNotification: selectedDateTime
      })

      navigation.navigate('Confirmation', {
        title: 'Tudo certo',
        subTitle: 'Fique tranquilo que sempre vamos lembrar você de cuidar da sua plantinha com muito cuidado.',
        buttonTitle: 'Muito Obrigado',
        icon: 'hug',
        nextScreen: 'MyPlants'
      })

    } catch  {
      Alert.alert('Não foi possível salvar')
    }
  }, [selectedDateTime, navigation])

  

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.planInfo}>
          <SvgFromUri 
            uri={plant.photo}
            height={150}
            width={150}
          />

          <Text style={styles.planName}>{plant.name}</Text>

          <Text style={styles.planAbout}>
            {plant.about}
          </Text>
        </View>
        <View style={styles.controller}>
          <View style={styles.tipContainer}>
            <Image 
              source={waterdrop}
              style={styles.tipImage}
            />

            <Text style={styles.tipText}>
              {plant.water_tips}
            </Text>
          </View>
          <Text style={styles.alertLabel}>
            Escolha o melhor horário para ser lembrado
          </Text>

          {showDatePicker && 
            <DateTimePicker 
              value={selectedDateTime}
              mode="time"
              display="spinner"
              onChange={handleChangeTime}
            />
          }
          {
            Platform.OS === 'android' && (
              <TouchableOpacity style={styles.dateTimePickerButton} onPress={handleOpenDateTimePickerForAndroid}>
                <Text style={styles.dateTimePickerText}>
                  {`Mudar ${format(selectedDateTime, 'HH:mm')}`}
                </Text>
              </TouchableOpacity>
            )
          }

          <Button title="Cadastrar planta" onPress={handleSave} />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.shape
  },
  planInfo:{
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.shape
  },
  planName:{
    fontFamily: fonts.headeing,
    color: colors.heading,
    fontSize: 24,
    marginTop: 15
  },
  planAbout:{
    textAlign: 'center',
    fontFamily: fonts.text,
    color: colors.heading,
    fontSize: 17,
    marginTop: 10
  },
  controller:{
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: getBottomSpace() || 20
  },
  tipContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.blue_light,
    borderRadius: 20,
    position: 'relative',
    bottom: 65
  },
  tipImage:{
    width: 56,
    height: 56
  },
  tipText:{
    flex: 1,
    marginLeft: 20,
    fontFamily: fonts.text,
    color: colors.blue,
    textAlign: 'justify'
  },
  alertLabel:{
    textAlign: 'center',
    fontFamily: fonts.complement,
    color: colors.heading,
    fontSize: 12,
    marginBottom: 5
  },
  dateTimePickerButton:{
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
    
  },
  dateTimePickerText:{
    color: colors.heading,
    fontSize: 24,
    fontFamily: fonts.text,
  }
})