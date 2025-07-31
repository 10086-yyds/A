import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, StyleProp, ViewStyle, TextStyle } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

//定义  props类型
interface NavbarProps {
    title?:string;
    showBack:boolean;
    backText?:string;
    backIcon?:ImageSourcePropType;
    rightComponent?:React.ReactNode;
    onBackPress?:()=>void;
    backgroundColor?:string;
    titleStyle?:StyleProp<TextStyle>;
    containerStyle?:StyleProp<ViewStyle>;
    backButtonStyle?:StyleProp<ViewStyle>;
}

const Navbar: React.FC<NavbarProps> = ({
    title = '',
    showBack = true,
    backText = '返回',
    backIcon,
    rightComponent = null,
    onBackPress = () => {},
    backgroundColor = '#FFFFFF',
    titleStyle = {},
    containerStyle = {},
    backButtonStyle = {},
}) => {
    const insets = useSafeAreaInsets();//获取安全区域内边距
    const handleBackPress = () => {
        onBackPress()
    }
    return (
        <View
        style={[
          styles.container,
          { backgroundColor, paddingTop: insets.top },
          containerStyle,
        ]}
      >
        <View style={styles.contentContainer}>
          {/* 返回按钮 */}
          {showBack && (
            <TouchableOpacity
              style={[styles.backButton, backButtonStyle]}
              onPress={handleBackPress}
            >
              {backIcon ? (
                <Image source={backIcon} style={styles.backIcon} />
              ) : (
                <Text style={styles.backText}>{backText}</Text>
              )}
            </TouchableOpacity>
          )}
  
          {/* 标题 */}
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
  
          {/* 右侧组件 */}
          {rightComponent ? (
            <View style={styles.rightContainer}>{rightComponent}</View>
          ) : (
            <View style={styles.rightSpacer} />
          )}
        </View>
      </View>
    )
}
const styles = StyleSheet.create({
    container: {
      width: '100%',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#EAEAEA',
      zIndex: 100,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 44,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      paddingRight: 10,
    },
    backIcon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
    },
    backText: {
      fontSize: 16,
      color: '#333333',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333333',
      maxWidth: '60%',
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightSpacer: {
      width: 40,
    },
  });
export default Navbar;
















