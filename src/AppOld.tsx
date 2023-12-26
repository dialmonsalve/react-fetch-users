import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { UsersList } from './components/UsersList'
import { SortBy, type User } from './types.d'

const fetchUsers = async (page: number) => {
  return await fetch(`https://randomuser.me/api?results=10&seed=dialmonsalve&page=${page}`)
    .then(async res => {
      if (!res.ok) throw new Error('Error en la petición')
      return await res.json()
    })
    .then(res => res.results)
}

function App () {
  const [users, setUsers] = useState<User[]>([])
  const [showColors, setShowColors] = useState(false)
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE)
  const [filterCountry, setFilterCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const originalUsers = useRef<User[]>([])

  const toggleColors = () => {
    setShowColors(!showColors)
  }

  const toggleSortByCountry = () => {
    const newSortingValue = sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE
    setSorting(newSortingValue)
  }

  const filteredUsers = useMemo(() => {
    return typeof filterCountry === 'string' && filterCountry.length > 0
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
      [SortBy.COUNTRY]: user => user.location.country,
      [SortBy.NAME]: user => user.name.first,
      [SortBy.LAST]: user => user.name.last
    }

    return filteredUsers.toSorted((a, b) => {
      const extractProperty = compareProperties[sorting]
      return extractProperty(a).localeCompare(extractProperty(b))
    })
  }, [filteredUsers, sorting])

  const handleDelete = (email: string) => {
    const filteredUsers = users.filter((user) => {
      return user.email !== email
    })
    setUsers(filteredUsers)
  }

  const handleChange = (sort: SortBy) => {
    setSorting(sort)
  }

  const handleReset = () => {
    setUsers(originalUsers.current)
  }

  useEffect(() => {
    setLoading(true)
    setError(false)

    fetchUsers(currentPage)
      .then(users => {
        setUsers(prevUsers => {
          const newUsers = prevUsers.concat(users)
          originalUsers.current = newUsers
          return newUsers
        })
      })
      .catch((err) => {
        console.error(err)
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentPage])

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
        {
          users.length > 0 && <UsersList
            changeSorting={handleChange}
            deleteUser={handleDelete}
            showColors={showColors}
            users={sortedUsers}
        />
        }
        {loading && <p>Cargando...</p>}
        {error && <p>Ha habido un error</p>}
        {!error && users.length === 0 && <p>No hay usuarios</p>}
      </main>
      {!loading && !error && <button onClick={() => {
        setCurrentPage(currentPage + 1)
      }} >Cargar mas resultados</button>}
    </div>
  )
}

export default App
