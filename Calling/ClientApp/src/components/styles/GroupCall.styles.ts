import { IStackItemStyles, IStackStyles, getTheme, mergeStyles } from '@fluentui/react';

const palette = getTheme().palette;
export const headerStyles: IStackItemStyles = {
  root: {
    width: '100%'
  }
};
export const containerStyles: IStackStyles = {
  root: {
    height: '100%',
    minHeight: '9.375rem',
    width: '100%'
  }
};
export const paneStyles: IStackItemStyles = {
  root: {
    width: '17.875rem'
  }
};
export const overlayStyles: IStackItemStyles = {
  root: {
    background: palette.white,
    marginTop: '4rem'
  }
};
export const hiddenContainerClassName: IStackItemStyles = {
  root: {
    border: `solid 1px ${palette.neutralLighterAlt}`,
    height: '100%',
    display: 'none'
  }
};
export const activeContainerClassName: IStackItemStyles = {
  root: {
    border: `solid 1px ${palette.neutralLighterAlt}`,
    height: 'calc(100% - 3px)',
    display: 'initial',
    width: '100%'
  }
};

export const loadingStyle = mergeStyles({
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

export const bannerStyle = mergeStyles({
    backgroundColor: '#444477',
    height: '36px',
    position: 'absolute',
    color: 'white',
    width: '100%',
    textAlign: 'center',
    lineHeight: '36px',
    zIndex: '9',
});
export const bannerDivStyle = mergeStyles({
    display: 'inline-block'
});
export const bannerMessageStyle = mergeStyles({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: '50%',
    textOverflow: 'ellipsis',
    display: 'inline-block',
    textAlign: 'left',
    '@media (max-width: 500px)': {
        width: '30%',
    }
});
export const headerStyle = mergeStyles({
    fontWeight: 'bold',
    display: 'inline-block',
    overflow: 'hidden'
});
export const dismissButtonStyle = mergeStyles({
    lineHeight: '22px',
    float: 'right',
    backgroundColor: 'transparent',
    border: '1px solid #bdb7b7',
    color: 'white',
    padding: '0 15px',
    margin: '6px',
    cursor: 'pointer',
    position: 'absolute',
    right: '0'
});
export const bannerWarningStyle = mergeStyles({
    color: 'white',
    position: 'relative',
    top: '3px',
    display: 'inline-block',
    overflow: 'hidden',
    marginLeft: '8%',
    '@media (min-width: 1750px)': {
        marginLeft: '20%',
    },
    '@media (min-width: 2000px)': {
        marginLeft: '22%',
    },
    '@media (min-width: 3550px)': {
        marginLeft: '32%',
    }
});
export const iconColor = mergeStyles({
    color: "white",
    backgroundColor: 'transparent'
});
export const bannerDismissOuterStyle = mergeStyles({
    display: 'inline',
    position: 'absolute',
    right: '0'
});