import { useEffect, useState } from 'react'

export interface IpApiResponse {
  ip: string
  version: string
  city: string
  region: string
  region_code: string
  country: string
  country_name: string
  country_code: string
  country_code_iso3: string
  country_capital: string
  country_tld: string
  continent_code: string
  in_eu: boolean
  postal: string | null
  latitude: number
  longitude: number
  timezone: string
  utc_offset: string
  country_calling_code: string
  currency: string
  currency_name: string
  languages: string
  asn: string
  org: string
  network: string
  country_area: number
  country_population: number
}

export function useUserLocation() {
  const [data, setData] = useState<IpApiResponse | null>(null)

  useEffect(() => {
    const fetchUserIp = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        if (!response.ok) throw new Error('Failed to fetch IP data')
        const json = await response.json()
        setData(json)
      } catch (err: any) {
        console.error(err)
      }
    }

    fetchUserIp()
  }, [])

  return data as IpApiResponse
}
