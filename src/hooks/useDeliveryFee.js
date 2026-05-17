import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useDeliveryFee = () => {
  const [deliveryFee, setDeliveryFee] = useState(1500)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurant_settings')
          .select('delivery_fee')
          .eq('id', 1)
          .limit(1)

        if (error) throw error
        const record = data?.[0]
        if (record?.delivery_fee != null) {
          setDeliveryFee(record.delivery_fee)
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