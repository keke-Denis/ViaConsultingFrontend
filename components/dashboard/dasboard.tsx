import React from 'react'
import PointCollecte from './pointCollecte/pointCollecte'
import InfosDistillation from './infosDistillaton/infosDistillation'
import ResumerVente from './resumerVente/resumerVente'
import RapportCollecteur from './rapportCollecteur/rapportCollecteur'

const Dasboard = () => {
  return (
    <div>
        <PointCollecte/>
        <RapportCollecteur/>
        <ResumerVente/>
        <InfosDistillation/>
    </div>
  )
}

export default Dasboard