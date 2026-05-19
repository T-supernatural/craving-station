import { useState, useEffect } from 'react'
import { fetchSettings } from '../lib/settingsApi'

export const useDeliveryFee = () => {
  const [deliveryFee, setDeliveryFee] = useState(1500)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const data = await fetchSettings()
        if (data?.delivery_fee != null) {
          setDeliveryFee(data.delivery_fee)
        }
      } catch (e) {
        // silently fall back to default
      } finally {
        setLoading(false)
      }
    }
    fetchFee()
  }, [])

  return { deliveryFee, loading }
}