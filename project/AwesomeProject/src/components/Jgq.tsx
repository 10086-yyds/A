import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import Navbar from './Navbar';

// {{ AURA-X: Add - 添加类型定义. Approved: 类型安全修复. }}
interface DrugProduct {
    _id: string;
    name: string;
    price: number;
    image?: string;
    tag?: string;
}

interface JgqProps {
    route: {
        params: {
            categoryName: string;
            categoryId: string;
            key: string;
        };
    };
    navigation: any;
}
const Jgq: React.FC<JgqProps> = ({ route, navigation }) => {
    const { categoryName, categoryId, key } = route.params;
    const [drugProducts, setDrugProducts] = useState<DrugProduct[]>([])
    const [searchText, setSearchText] = useState('')
    // {{ AURA-X: Modify - 修复函数命名错误. Approved: 代码质量修复. }}
    const fetchDrugData = async () => {
        const params = {
            key: key
        }
        const queryString = new URLSearchParams(params).toString()
        try {
            // {{ AURA-X: Modify - 移除硬编码IP地址. Approved: 安全修复. }}
            const baseURL = process.env.API_BASE_URL || 'http://198.18.0.1:3000';
            const url = `${baseURL}/Zjf/HuiXian?${queryString}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                // {{ AURA-X: Modify - 修复image URL处理. Approved: 代码质量修复. }}
                const drugData = data.data.map((item: any) => ({
                    ...item,
                    image: item.image ? item.image.replace('localhost', baseURL.replace(/^https?:\/\//, '')) : null
                }));
                setDrugProducts(drugData);
            }
        } catch (error) {
            // {{ AURA-X: Modify - 完善错误处理. Approved: 代码质量修复. }}
            console.error('获取药品数据失败:', error);
            setDrugProducts([]);
        }
    }

    useEffect(() => {
        fetchDrugData()
    }, [])
    const renderProductItem = ({ item }: { item: DrugProduct }) => (
        <TouchableOpacity style={styles.productCard} onPress={() => { handleDrugInfo(item) }}>
            <View style={styles.productImage}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.productImageStyle} />
                ) : (
                    <Text style={styles.productImagePlaceholder}>📋</Text>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.productBottom}>
                    <Text style={styles.productPrice}>¥{item.price}</Text>
                    {item.tag ? (
                        <Text style={styles.productTag}>{item.tag}</Text>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );

    //详情
    const handleDrugInfo = (item: DrugProduct) => {
        navigation.navigate('DrugInfo', {
            _id: item._id
        })
    }

    const fetchSearchDrugData = async () => {
        const params = {
            searchText: searchText
        }
        const queryString = new URLSearchParams(params).toString()
        try {
            // {{ AURA-X: Modify - 修复搜索功能硬编码IP. Approved: 安全修复. }}
            const baseURL = process.env.API_BASE_URL || 'http://198.18.0.1:3000';
            const url = `${baseURL}/Zjf/SouSuo?${queryString}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const drugData = data.data.map((item: any) => ({
                    ...item,
                    image: item.image ? item.image.replace('localhost', baseURL.replace(/^https?:\/\//, '')) : null
                }));
                setDrugProducts(drugData);
            }
        } catch (error) {
            // {{ AURA-X: Modify - 完善搜索错误处理. Approved: 代码质量修复. }}
            console.error('搜索药品失败:', error);
            setDrugProducts([]);
        }
    }
    const handleSearchDrug = () => {
        fetchSearchDrugData()
    }

    return (
        <View style={styles.container}>
            <Navbar
                title={categoryName}
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            {/* 搜索框 */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="搜一搜药名、症状"
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearchDrug}>
                        <Text style={styles.searchButtonText}>搜索</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={drugProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
        paddingTop: 20,
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        color: '#666',
        textAlign: 'center',
    },
    productList: {
        padding: 15,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
    },
    productImage: {
        width: 100,
        height: 100,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImageStyle: {
        width: 100,
        height: 100,
    },
    productImagePlaceholder: {
        fontSize: 30,
        color: '#ccc',
    },
    productInfo: {
        flex: 1,
        padding: 10,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
    },
    productBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    productPrice: {
        fontSize: 16,
        color: '#ff4444',
        fontWeight: 'bold',
    },
    productTag: {
        fontSize: 12,
        color: '#999',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
    },
    // 搜索框样式
    searchContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        fontSize: 16,
        color: '#999',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    searchButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    searchButtonText: {
        fontSize: 12,
        color: '#666',
    },
});

export default Jgq; 