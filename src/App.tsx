import { useMemo, useState } from 'react'
import './App.css'
import { UsersList } from './components/UsersList'
import { SortBy, type User } from './types.d'
import { useUsers } from './hooks/useUsers'

function App () {
  const { users, fetchNextPage, hasNextPage, isError, isLoading, refetch } = useUsers()

  const [showColors, setShowColors] = useState(false)
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE)
  const [filterCountry, setFilterCountry] = useState<string | null>(null)

  const toggleColors = () => {
    setShowColors(!showColors)
  }

  const toggleSortByCountry = () => {
    const newSortingValue =
      sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE
    setSorting(newSortingValue)
  }

  const filteredUsers = useMemo(() => {
    return filterCountry !== null && filterCountry.length > 0
      ? users.filter((user) => {
        return user.location.country
          .toLowerCase()
          .includes(filterCountry.toLowerCase())
      })
      : users
  }, [users, filterCountry])

  const sortedUsers = useMemo(() => {
    if (sorting === SortBy.NONE) return filteredUsers

    const compareProperties: Record<string, (user: User) => any> = {
      [SortBy.COUNTRY]: (user) => user.location.country,
      [SortBy.NAME]: (user) => user.name.first,
      [SortBy.LAST]: (user) => user.name.last
    }

    return filteredUsers.toSorted((a, b) => {
      const extractProperty = compareProperties[sorting]
      return extractProperty(a).localeCompare(extractProperty(b))
    })
  }, [filteredUsers, sorting])

  const handleDelete = (email: string) => {
    // const filteredUsers = users.filter((user) => {
    //   return user.email !== email
    // })
    // setUsers(filteredUsers)
  }

  const handleChange = (sort: SortBy) => {
    setSorting(sort)
  }

  const handleReset = () => {
    void refetch()
  }

  return (
    <div className='App'>
      <header>
        <h1>Prueba</h1>
        <button onClick={toggleColors}>Colorear filas</button>
        <button onClick={toggleSortByCountry}>
          {sorting === SortBy.COUNTRY ? 'No ordenar' : 'Ordenar por país'}
        </button>
        <button onClick={handleReset}>Reset usuarios</button>
        <input
          type='text'
          placeholder='Filtra por país'
          onChange={(e) => {
            setFilterCountry(e.target.value)
          }}
        />
      </header>
      <main>
        {users.length > 0 && (
          <UsersList
            changeSorting={handleChange}
            deleteUser={handleDelete}
            showColors={showColors}
            users={sortedUsers}
          />
        )}
        {isLoading && <p>Cargando...</p>}
        {isError && <p>Ha habido un error</p>}
        {!isLoading && !isError && users.length === 0 && <p>No hay usuarios</p>}
        {!isLoading && !isError && hasNextPage && <button
            onClick={() => {
              void fetchNextPage()
            }}
          >
            Cargar mas resultados
          </button>
        }
        {!isLoading && !isError && !hasNextPage && <p>No hay más resultados</p>}
      </main>
    </div>
  )
}

export default App
