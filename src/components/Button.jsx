import React from 'react'

const Button = ({onSave}) => {

  return (
    <div><button className="button" onClick={onSave}>Save</button></div>
  )
}

export default Button