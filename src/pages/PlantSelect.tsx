import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import { EnviromentButton } from '../components/EnviromentButton'
import { Load } from '../components/Load'
import { Header } from '../components/Header'
import { PlanCardPrimary } from '../components/PlantCardPrimary'

import colors from '../styles/colors'
import fonts from '../styles/fonts'

import api from '../services/api'

interface EnviromentProps {
  key: string;
  title: string;
}

interface PlantProps {
  id: string;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: [string];
  frequency: {
    times: number;
    repeat_every: string;
  }
}

export function PlanSelect(){
  const [environments, setEnvironments] = useState<EnviromentProps[]>([])
  const [plants, setPlants] = useState<PlantProps[]>([])
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([])
  const [environmentSelected, setEnvironmentSelected] = useState('all')
  const [loading, setLoading] = useState(true)
  
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  
  function handleEnviromentSelected(environment : string){
    setEnvironmentSelected(environment)

    if(environment === 'all')
      return setFilteredPlants(plants)
    

    const filtered = plants.filter(plant => 
      plant.environments.includes(environment)  
    )
    setFilteredPlants(filtered)
  }

  async function fetchPlant() {
    const { data } = await api.get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`)

    if(!data){
      return setLoading(true)
    }
    if(page > 1){
      setPlants(oldValue => [...oldValue, ...data])
      setFilteredPlants(oldValue => [...oldValue, ...data])
    } else {
      setPlants(data)
      setFilteredPlants(data)        
    }
    setLoading(false)
    setLoadingMore(false)
  }

  function handleFetchMore(distance: number){
    if(distance < 1){
      return;
    }

    setLoadingMore(true)
    setPage(oldValue => oldValue+1)
    fetchPlant()
  }

  useEffect(() => {
    async function fetchEnviroment() {
      const { data } = await api.get('plants_environments?_sort=title&_order=asc')
      setEnvironments([
        {
          key: 'all',
          title: 'Todos'
        },
        ...data
      ])
    }

    fetchEnviroment()
  } ,[])

  useEffect(() => {    

    fetchPlant()
  } ,[])

  
  if(loading) {
    return <Load />
  }
  return (    
      <View style={styles.container}>
        <View style={styles.header}>
          <Header />
          <Text style={styles.title}>
            Em qual ambiente
          </Text>
          <Text style={styles.subTitle}>
            você quer colocar sua planta?
          </Text>
        </View>
        <View>
          <FlatList 
            data={environments}
            initialNumToRender={environments.length}
            renderItem={({ item })=> 
              <EnviromentButton 
                key={item.key} 
                title={item.title} 
                
                active={item.key === environmentSelected} 
                onPress={() => handleEnviromentSelected(item.key)}
              />
            }
            // keyExtractor={() => }
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.enviromentList}
          />
        </View>

        <View style={styles.plants}>
          <FlatList 
            data={filteredPlants}
            renderItem={({ item })=> <PlanCardPrimary data={item} />}          
            showsVerticalScrollIndicator={false}
            numColumns={2}
            contentContainerStyle={styles.contentContainerStyle}
            onEndReachedThreshold={0.1}
            onEndReached={({ distanceFromEnd }) => handleFetchMore(distanceFromEnd)}
            ListFooterComponent={
              loadingMore ? 
                <ActivityIndicator color={colors.green} />
                : <></>
            }
          />
        </View>
        
      </View>  
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    backgroundColor: colors.background,  
  },
  header:{
    paddingHorizontal: 30,
  },
  title:{
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.headeing,
    lineHeight: 20,
    marginTop: 15
  },
  subTitle:{
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.text,
    lineHeight: 20,
  },
  enviromentList:{
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    paddingLeft: 32,    
    marginVertical: 32
  },
  plants:{
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center'
  },
  contentContainerStyle:{
    
  }
})