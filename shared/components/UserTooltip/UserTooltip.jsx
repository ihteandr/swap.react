import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './UserTooltip.scss'

import ArrowRightSvg from './arrow-right.svg'
import AcceptSvg from './accept.svg'

function UserTooltip({ open }) {
  return (
    <div styleName="user-tooltip">
      { open === true ? <p>Money withdraw</p> : '' }
    </div>
  )
}

UserTooltip.propTypes = {
  open: PropTypes.bool.isRequired,
}

export default CSSModules(UserTooltip, styles)
// swap notification
// <div className="user-tooltip__info">
//     <div className="user-tooltip__info-title">User want to swap</div>
//     <div className="user-tooltip__currency">
//         <span className="user-tooltip__from">10 <span className="user-tooltip__coin">eth</span></span>
//         <span className="user-tooltip__arrow"><img src={ArrowRightSvg} alt=""/></span>
//         <span className="user-tooltip__to">1 <span className="user-tooltip__coin">btc</span></span>
//     </div>
// </div>

// <div className="user-tooltip__checked" >
//     <img src={AcceptSvg} alt=""/>
// </div>