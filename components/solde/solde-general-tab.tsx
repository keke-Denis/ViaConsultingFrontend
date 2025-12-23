import React from 'react'
import SoldeCard from './soldeGenerale/soldeCard'
import SoldeTable from './soldeGenerale/soldeTable'

const SoldeGeneralTab = () => {
  return (
    <div className="space-y-6">
        <SoldeCard />
        <SoldeTable />
    </div>
  )
}

export default SoldeGeneralTab